import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Banner } from '@/types/banner';

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const BANNERS_SHEET = 'Banners';
const BANNERS_RANGE = `${BANNERS_SHEET}!A2:I`;
const BANNERS_FULL_RANGE = `${BANNERS_SHEET}!A:I`;
const BANNERS_HEADERS_RANGE = `${BANNERS_SHEET}!A1:I1`;

const BANNER_HEADERS = ['id', 'title', 'subtitle', 'description', 'imageUrl', 'ctaText', 'ctaLink', 'isActive', 'sortOrder'];

async function getSheetsClient(scopes: string[]) {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL!;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n');

  if (
    !clientEmail ||
    clientEmail.includes('your-service-account') ||
    !privateKey ||
    privateKey.includes('YOUR_PRIVATE_KEY')
  ) {
    throw new Error('Google Sheets credentials not properly configured.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes,
  });

  return google.sheets({ version: 'v4', auth });
}

function parseBannerRow(row: string[], index: number): Banner {
  // If id is empty, derive a unique stable id from row content hash
  let id = row[0];
  if (!id || id.trim() === '') {
    // Hash the row content to create a deterministic unique id
    const hash = Array.from(row.join('|'))
      .reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0)
      .toString(36)
      .replace(/^-/, '0');
    id = `banner_${hash}`;
  }
  const isActive = row[7]?.toString().toLowerCase() === 'true' || row[7] === '1';
  const sortOrder = parseInt(row[8] || '0') || index;
  return {
    id,
    title: row[1] || '',
    subtitle: row[2] || '',
    description: row[3] || '',
    imageUrl: row[4] || '',
    ctaText: row[5] || '',
    ctaLink: row[6] || '',
    isActive,
    sortOrder,
  };
}

// GET /api/banners — fetch all banners
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const includeInactive = searchParams.get('includeInactive') === 'true';

  try {
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets.readonly']);

    let rows: string[][] = [];
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: BANNERS_RANGE,
      });
      rows = response.data.values || [];
    } catch {
      // Banners sheet might not exist yet — return empty
      return NextResponse.json({ banners: [] });
    }

    const banners: Banner[] = rows.map((row, i) => parseBannerRow(row, i));

    // Filter active unless includeInactive is set
    const filtered = includeInactive ? banners : banners.filter((b) => b.isActive);

    // Sort by sortOrder
    filtered.sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json({ banners: filtered });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ error: 'Failed to fetch banners', banners: [] }, { status: 500 });
  }
}

/** Utility: ensure the Banners sheet exists, create it if not */
async function ensureBannersSheet(sheets: ReturnType<typeof google.sheets>) {
  try {
    // Try reading headers — will throw if sheet doesn't exist
    await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: BANNERS_HEADERS_RANGE,
    });
  } catch {
    // Sheet doesn't exist — create it and write headers
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{
          addSheet: {
            properties: { title: BANNERS_SHEET },
          },
        }],
      },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: BANNERS_HEADERS_RANGE,
      valueInputOption: 'RAW',
      requestBody: { values: [BANNER_HEADERS] },
    });
  }
}

// POST /api/banners — create a new banner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, subtitle, description, imageUrl, ctaText, ctaLink, isActive, sortOrder } = body;

    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);

    // Ensure the Banners sheet exists
    await ensureBannersSheet(sheets);

    // Get existing rows to determine next id
    let existingRows: string[][] = [];
    try {
      const existing = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: BANNERS_RANGE,
      });
      existingRows = existing.data.values || [];
    } catch {
      existingRows = [];
    }

    const nextId = `banner_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${BANNERS_SHEET}!A:I`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          nextId,
          title || '',
          subtitle || '',
          description || '',
          imageUrl || '',
          ctaText || '',
          ctaLink || '',
          isActive ? 'true' : 'false',
          (sortOrder ?? existingRows.length).toString(),
        ]],
      },
    });

    return NextResponse.json({ success: true, message: 'Banner created successfully', id: nextId });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}

// PUT /api/banners — update a banner
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, subtitle, description, imageUrl, ctaText, ctaLink, isActive, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }

    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: BANNERS_FULL_RANGE,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === id);

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    const updateRange = `Banners!A${rowIndex + 2}:I${rowIndex + 2}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          id,
          title || '',
          subtitle || '',
          description || '',
          imageUrl || '',
          ctaText || '',
          ctaLink || '',
          isActive ? 'true' : 'false',
          (sortOrder || rowIndex).toString(),
        ]],
      },
    });

    return NextResponse.json({ success: true, message: 'Banner updated successfully' });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

// DELETE /api/banners — deletes a banner
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }

    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: BANNERS_FULL_RANGE,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === id);

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    const deleteRange = `Banners!A${rowIndex + 2}:I${rowIndex + 2}`;
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEET_ID,
      range: deleteRange,
    });

    return NextResponse.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
