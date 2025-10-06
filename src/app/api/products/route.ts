import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from '@/types/company';

const SHEET_ID = process.env.GOOGLE_SHEET_ID!; // Your Google Sheet ID
const RANGE = 'Sheet1!A2:I'; // Adjust range to include Category and Hidden
const FULL_RANGE = 'Sheet1!A:I'; // Full range including headers
const SETTINGS_RANGE = 'Settings!A2:H2';

async function getSheetsClient(scopes: string[]) {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL!;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n');

  if (
    !clientEmail ||
    clientEmail.includes('your-service-account') ||
    !privateKey ||
    privateKey.includes('YOUR_PRIVATE_KEY')
  ) {
    throw new Error('Google Sheets credentials not properly configured. Please update .env.local with real service account credentials.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes,
  });

  return google.sheets({ version: 'v4', auth });
}

function parseCompanyRow(row?: string[]): CompanyProfile {
  if (!row || row.length === 0) {
    return DEFAULT_COMPANY_PROFILE;
  }

  const [name, tagline, description, email, phone, website, address, showPrices] = row;

  return {
    name: name || DEFAULT_COMPANY_PROFILE.name,
    tagline: tagline || DEFAULT_COMPANY_PROFILE.tagline,
    description: description || DEFAULT_COMPANY_PROFILE.description,
    email: email || DEFAULT_COMPANY_PROFILE.email,
    phone: phone || DEFAULT_COMPANY_PROFILE.phone,
    website: website || DEFAULT_COMPANY_PROFILE.website,
    address: address || DEFAULT_COMPANY_PROFILE.address,
    showPrices: showPrices === 'FALSE' ? false : true, // Default to true if not set
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const includeHidden = searchParams.get('includeHidden') === 'true';
  const search = (searchParams.get('search') || '').toLowerCase();
  const category = (searchParams.get('category') || '').toLowerCase();

  try {
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets.readonly']);

    const [productResponse, settingsResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: RANGE,
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: SETTINGS_RANGE,
      }).catch((error) => {
        console.warn('Company settings range missing or unreadable:', error);
        return undefined;
      }),
    ]);

    const rows = productResponse.data.values || [];
    const settingsRow = settingsResponse?.data.values?.[0];
    const company = parseCompanyRow(settingsRow);

    // Helper function to validate URL
    const isValidUrl = (string: string) => {
      try {
        new URL(string);
        return true;
      } catch {
        return false;
      }
    };

    // Assuming columns: id, name, description, price, imageUrl, qrCode, inventory, category, hidden
    const products = rows.map((row) => {
      let imageUrl = row[4];
      // Validate imageUrl - if invalid or empty, use a placeholder
      if (!imageUrl || imageUrl.trim() === '' || !isValidUrl(imageUrl)) {
        imageUrl = 'https://via.placeholder.com/400x300?text=No+Image';
      }
      const categoryValue = (row[7] || '').toString();
      return {
        id: row[0],
        name: row[1],
        description: row[2],
        price: parseFloat(row[3]),
        imageUrl,
        qrCode: row[5],
        inventory: parseInt(row[6] || '0'),
        category: categoryValue,
        hidden: row[8]?.toString().toLowerCase() === 'true' || row[8] === '1',
      };
    });

    if (id) {
      const product = products.find(p => p.id === id);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ ...product, company });
    }

    // Filter products based on visibility, category and search
    const visibleProducts = includeHidden ? products : products.filter(p => !p.hidden);
    const categories = Array.from(
      new Set(
        visibleProducts
          .map((product) => (product.category || '').toString().trim())
          .filter(Boolean)
      )
    );

    let filteredProducts = visibleProducts;

    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(p => (p.category || '').toLowerCase() === category);
    }

    if (search) {
      filteredProducts = filteredProducts.filter(p => {
        const q = search.toLowerCase();
        return [p.name, p.description, p.id, p.category]
          .filter(Boolean)
          .some((val) => (val as string).toLowerCase().includes(q));
      });
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const total = filteredProducts.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedProducts = filteredProducts.slice(start, end);

    return NextResponse.json({
      products: paginatedProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      categories,
      company,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: 'Failed to fetch products',
      details: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, price, imageUrl, qrCode, inventory, category, hidden } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);

    // Get all data to find the row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: FULL_RANGE,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === id); // Skip header row

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update the row (add 2 to rowIndex because sheets are 1-indexed and we skip header)
    const updateRange = `Sheet1!A${rowIndex + 2}:I${rowIndex + 2}`;
    const values = [[id, name, description, price.toString(), imageUrl, qrCode || '', inventory.toString(), category || '', hidden ? 'true' : 'false']];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: 'Failed to update product',
      details: errorMessage
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, imageUrl, qrCode, inventory, category, hidden } = body;

    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);

    // Get all data to find the next ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: FULL_RANGE,
    });

    const rows = response.data.values || [];
    const lastRow = rows.length;
    const nextId = (lastRow).toString(); // Simple ID generation

    // Append new row
    const values = [[nextId, name, description, price.toString(), imageUrl, qrCode || '', inventory.toString(), category || '', hidden ? 'true' : 'false']];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:I',
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return NextResponse.json({
      success: true,
      message: 'Product added successfully',
      id: nextId
    });
  } catch (error) {
    console.error('Error adding product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: 'Failed to add product',
      details: errorMessage
    }, { status: 500 });
  }
}
