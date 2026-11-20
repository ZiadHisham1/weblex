import NavBar from '@/components/section/navbar';

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <h1 className="text-5xl font-bold tracking-tight">Weblex</h1>
          <p className="mt-3 text-gray-600">
            Build a website for your business in minutes.
          </p>
          <div className="mt-8 flex gap-3 justify-center">
            <a href="/signup" className="bg-black text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-800">
              Get started
            </a>
            <a href="/login" className="border border-gray-300 px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-50">
              Sign in
            </a>
          </div>
        </div>
      </main>
    </>
  );
}