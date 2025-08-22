// app/host/pending/page.tsx

export default function HostPendingPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='bg-white p-6 rounded-lg shadow-lg text-center'>
        <h1 className='text-2xl font-semibold mb-2 text-gray-800'>
          Thank you for logging in
        </h1>
        <p className='text-gray-600'>
          Please wait until your account is approved.
        </p>
      </div>
    </div>
  );
}
