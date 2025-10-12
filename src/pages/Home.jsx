function Home() {
  return (
    <div className="w-full bg-black text-white">
      {/* Hero Section */}
      <div className="w-full min-h-screen relative">
        {/* Background image container */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/Your Blood Type is a Lot More Complicated Than You Think.jpg" 
            alt="Blood cells background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        {/* Content container */}
        <div className="relative z-10 w-full h-full flex items-center min-h-screen">
          <div className="w-full px-8 lg:px-16">
            <div className="max-w-none text-left">
              <h1 className="text-6xl font-bold mb-8">
                Become a Donor
              </h1>

              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">
                  Why donate blood?
                </h2>
                <div className="space-y-4 text-lg">
                  <p>"Every 2 seconds, someone needs blood."</p>
                  <p>"1 donation can save up to 3 lives."</p>
                  <p>"Join 200+ registered donors on our platform!"</p>
                </div>
              </div>

              <div className="flex gap-4 justify-start mb-16">
                <button className="bg-red-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors">
                  Register
                </button>
                <button className="bg-white text-gray-800 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                  Login
                </button>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-3 sm:gap-10 max-w-2xl justify-start text-left">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-left">
                  <div className="text-3xl font-bold mb-1">20+</div>
                  <div className="text-m">Events</div>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-left">
                  <div className="text-3xl font-bold mb-1">200+</div>
                  <div className="text-m">Donors</div>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-left">
                  <div className="text-3xl font-bold mb-1">10+</div>
                  <div className="text-m">Organizers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section className="w-full min-h-screen bg-gray-900 flex items-center">
        <div className="w-full px-8 lg:px-16">
          <h2 className="text-4xl font-bold mb-6">About Us</h2>
          <p className="text-lg max-w-none">
            Our platform connects donors with those in need of blood. We aim to make the process seamless, efficient, and impactful. Join us in saving lives and making a difference in the community.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full min-h-screen bg-gray-800 flex items-center">
        <div className="w-full px-8 lg:px-16">
          <h2 className="text-4xl font-bold mb-6">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-4">Blood Donation Events</h3>
              <p>Organize and participate in blood donation drives in your community.</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-4">Donor Management</h3>
              <p>Track your donation history and schedule appointments easily.</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-4">Emergency Requests</h3>
              <p>Connect with donors quickly during urgent blood requirements.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full h-24 bg-black flex items-center justify-center">
        <p className="text-gray-400">© 2025 Blood Donation Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;