<header className="fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)] min-h-[calc(44px+env(safe-area-inset-top)+48px)] backdrop-blur-md bg-gradient-to-r from-black/80 to-black/80 border-b border-white/10 header-safe-area">
  <div className="max-w-screen-xl mx-auto flex justify-between items-center px-4 h-[72px]">
    {/* Logo */}
    <div 
      className="flex items-center cursor-pointer"
      onClick={() => navigate('/')}
    >
      <span className="text-lg font-bold font-orbitron bg-gradient-to-r from-[#7B2EFF] to-[#00D1FF] bg-clip-text text-transparent">
        M1SSION
      </span>
    </div>

    {/* Center status */}
    <div className="flex items-center gap-3">
      <RealtimeStatusIndicator isConnected={isConnected} />
    </div>

    {/* Right buttons */}
    <div className="flex items-center gap-4">
      {/* Notifications */}
      <button 
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
        onClick={onShowNotifications}
      >
        <Bell className="w-5 h-5 text-[#00D1FF]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#F059FF] w-2 h-2 rounded-full shadow-md" />
        )}
      </button>

      {/* Profile */}
      <button 
        className="h-9 w-9 rounded-full border-2 border-[#00D1FF]/30 hover:border-[#00D1FF] overflow-hidden transition-colors"
        onClick={() => navigate('/profile')}
      >
        {profileImage ? (
          <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
            <span className="text-sm text-white">User</span>
          </div>
        )}
      </button>

      {/* Mobile menu toggle */}
      <button 
        className="sm:hidden p-2 rounded-full hover:bg-white/10 transition-colors"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <Menu className="w-5 h-5 text-[#00D1FF]" />
      </button>
    </div>
  </div>

  {/* Mobile menu */}
  {isMenuOpen && (
    <div className="absolute top-full left-0 w-full bg-black/90 border-t border-white/10 px-4 py-3 sm:hidden">
      <div className="space-y-2">
        <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/buzz'); setIsMenuOpen(false); }}>
          Buzz
        </Button>
        <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/map'); setIsMenuOpen(false); }}>
          Mappa
        </Button>
        <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/events'); setIsMenuOpen(false); }}>
          Eventi
        </Button>
      </div>
    </div>
  )}
</header>
