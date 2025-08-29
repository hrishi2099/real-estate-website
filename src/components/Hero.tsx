import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-6 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <main className="mt-6 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="text-center sm:text-center lg:text-left">
              <div className="text-2xl tracking-tight font-extrabold text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
                <h1 className="block">Find Your Perfect Plot</h1>
                <p className="block text-blue-600 mt-1">Invest in Your Future</p>
              </div>
              <p className="mt-3 text-sm text-gray-500 sm:mt-5 sm:text-base md:text-lg sm:max-w-xl sm:mx-auto lg:mx-0 lg:text-xl leading-relaxed">
                Discover a wide range of premium properties and exclusive investment opportunities in the most sought-after locations. Whether you're looking for a place to call home or a strategic investment, our curated collection has something for everyone.
              </p>
              <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:justify-center lg:justify-start">
                <Link
                  href="/properties"
                  className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 touch-manipulation md:py-4 md:text-lg md:px-10"
                >
                  View Properties
                </Link>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 touch-manipulation md:py-4 md:text-lg md:px-10"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <div className="h-48 w-full bg-cover bg-center sm:h-64 md:h-80 lg:w-full lg:h-full" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2232&q=80')"
        }}>
        </div>
      </div>
    </div>
  );
}