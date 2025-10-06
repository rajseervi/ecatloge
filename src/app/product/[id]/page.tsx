'use client';

import { useEffect, useState, Suspense } from 'react';
import { Product } from '@/types/product';
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from '@/types/company';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ProductContent() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);

  useEffect(() => {
    const fetchData = async () => {
      if (typeof id === 'string') {
        try {
          // Fetch product
          const productResponse = await fetch(`/api/products?id=${id}`);
          if (productResponse.ok) {
            const productData = await productResponse.json();
            setProduct(productData);
          }

          // Fetch company settings
          const companyResponse = await fetch('/api/company');
          if (companyResponse.ok) {
            const companyData = await companyResponse.json();
            if (companyData.company) {
              setCompany({ ...DEFAULT_COMPANY_PROFILE, ...companyData.company });
            }
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [id]);

  const getStockStatus = (inventory: number) => {
    if (inventory === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (inventory <= 5) return { status: 'Low Stock', color: 'bg-orange-100 text-orange-800' };
    return { status: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.inventory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                ← Back
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Catalog
              </Link>
              <Link
                href="/admin"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Product Image Section */}
            <div className="md:w-1/2 relative">
              <div className="aspect-square relative bg-gray-100">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
                  </div>
                )}
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
              </div>
            </div>

            {/* Product Details Section */}
            <div className="md:w-1/2 p-8">
              <div className="space-y-6">
                {/* Product Name */}
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                    {product.name}
                  </h1>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-4">
                  {company.showPrices && (
                    <span className="text-4xl font-bold text-green-600">
                      ${(product.price || 0).toFixed(2)}
                    </span>
                  )}
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${stockStatus.color}`}>
                    {stockStatus.status}
                  </span>
                </div>

                {/* Stock Count */}
                <div className="text-sm text-gray-600">
                  {product.inventory > 0 ? (
                    <span className="text-green-600 font-medium">
                      {product.inventory} item{product.inventory !== 1 ? 's' : ''} available
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">Currently unavailable</span>
                  )}
                </div>

                {/* Description */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  {product.inventory > 0 ? (
                    <>
                      <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                        Add to Cart
                      </button>
                      <button className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg">
                        Buy Now
                      </button>
                    </>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 px-6 py-3 rounded-lg font-semibold cursor-not-allowed"
                    >
                      Out of Stock
                    </button>
                  )}
                </div>

                {/* QR Code Section */}
                {product.qrCode && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">QR Code</h3>
                    <div className="bg-gray-50 p-4 rounded-lg inline-block">
                      <Image
                        src={product.qrCode}
                        alt="Product QR Code"
                        width={120}
                        height={120}
                        className="rounded"
                      />
                    </div>
                  </div>
                )}

                {/* Product ID */}
                <div className="border-t border-gray-200 pt-6">
                  <p className="text-sm text-gray-500">
                    Product ID: <span className="font-mono">{product.id}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Placeholder */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Related products feature coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <ProductContent />
    </Suspense>
  );
}