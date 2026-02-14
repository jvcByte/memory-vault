export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-3xl font-heading mb-4">Access Denied</h1>
        <p className="text-gray-300 mb-6">
          This is a private application. Only authorized users can access this content.
        </p>
        <a
          href="/login"
          className="inline-block px-6 py-3 bg-primary rounded-lg hover:bg-primary/80 transition"
        >
          Back to Login
        </a>
      </div>
    </div>
  )
}
