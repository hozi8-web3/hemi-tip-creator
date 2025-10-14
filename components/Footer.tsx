import Link from 'next/link'
import { Github, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-800 bg-black/50 backdrop-blur-sm mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo and Copyright */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">
              © {new Date().getFullYear()} TipChain. All rights reserved.
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-6">
            <Link
              href="https://github.com/hozi8-web3"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-400 transition-colors"
            >
              <Github className="w-5 h-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link
              href="https://twitter.com/hozaifaa095"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-400 transition-colors"
            >
              <Twitter className="w-5 h-5" />
              <span className="sr-only">X (Twitter)</span>
            </Link>
            <a
              href="mailto:contact@tipchain.xyz"
              className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
            >
              contact@hemi-tipchain.xyz
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
