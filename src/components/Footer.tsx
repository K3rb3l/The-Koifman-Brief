export function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <p className="text-sm text-muted font-sans">
          &copy; {new Date().getFullYear()} The Koifman Brief. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
