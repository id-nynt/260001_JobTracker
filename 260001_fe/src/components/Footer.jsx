import { useTheme } from '../context/ThemeContext'

function Footer() {
  const { isDark } = useTheme()

  return (
    <footer className={`mt-16 pt-8 pb-6 ${isDark ? 'border-gray-600' : 'border-gray-300'} border-t`}>
      <div className="max-w-7xl mx-auto px-4 text-center">
        {/* Connect Section */}
        <div className="mb-2">
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'} mb-2`}>📫 Let's Connect</h3>
          <div className={`flex flex-wrap items-center justify-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
            <a href="mailto:id.tnyennhi@gmail.com" className={`${isDark ? 'hover:text-white' : 'hover:text-black'} transition`}>
              📧 id.tnyennhi@gmail.com
            </a>
            <span>|</span>
            <a href="tel:0412480535" className={`${isDark ? 'hover:text-white' : 'hover:text-black'} transition`}>
              📞 0412 480 535
            </a>
            <span>|</span>
            <a 
              href="https://www.linkedin.com/in/janny-tran-a31621192" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`${isDark ? 'hover:text-white' : 'hover:text-black'} transition`}
            >
              💼 LinkedIn
            </a>
            <span>|</span>
            <a 
              href="https://github.com/id-nynt" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`${isDark ? 'hover:text-white' : 'hover:text-black'} transition`}
            >
              💻 GitHub
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
          ©2026 Janny Tran. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
