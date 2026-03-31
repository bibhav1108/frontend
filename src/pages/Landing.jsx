import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";

const Landing = () => {
  return (
    <div className="min-h-screen bg-surface text-on_surface font-inter">
      <PublicNavbar />

      <main>
        {/* ================= HERO ================= */}
        <section className="relative min-h-[90vh] flex items-center px-6 md:px-16 py-24 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full -z-10" />

          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="px-4 py-2 rounded-full bg-surface_high text-primary text-xs font-semibold uppercase">
                AI-Powered Logistics
              </div>

              <h1 className="text-5xl md:text-7xl font-outfit font-extrabold leading-[1.1] tracking-tight">
                Empowering NGOs with{" "}
                <span className="text-primary">Better Coordination.</span>
              </h1>

              <p className="text-xl text-on_surface_variant max-w-lg">
                Connect surplus resources with real-world needs through a
                unified platform designed for NGOs and volunteers.
              </p>

              <div className="flex gap-4 flex-wrap">
                <Link className="bg-primaryGradient text-white px-8 py-4 rounded-lg font-bold">
                  Get Started
                </Link>

                <Link className="bg-surface_highest text-primary px-8 py-4 rounded-lg font-bold">
                  Explore Platform
                </Link>
              </div>
            </div>

            {/* image */}
            <div className="relative">
              <div className="bg-surface/60 backdrop-blur-glass p-4 rounded-xl shadow-soft">
                <img
                  src="https://images.unsplash.com/photo-1606787366850-de6330128bfc"
                  className="rounded-lg w-full object-cover"
                />

                {/* removed fake stats */}
                <div className="absolute -bottom-6 -left-6 bg-surface/80 backdrop-blur-glass p-4 rounded-lg shadow-soft">
                  <p className="text-sm text-on_surface_variant">
                    Real-time coordination interface
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PROBLEM ================= */}
        <section className="py-32 px-6 md:px-16 bg-surface_low">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="grid grid-cols-2 gap-4">
              {[
                "Logistics Fatigue",
                "Data Silos",
                "Supply Gaps",
                "Volunteer Mismatch",
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-surface_lowest p-6 rounded-lg shadow-soft"
                >
                  <h4 className="font-outfit font-bold mb-2">{item}</h4>
                  <p className="text-sm text-on_surface_variant">
                    Common coordination challenges faced in humanitarian
                    workflows.
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl font-outfit font-extrabold">
                Focus on <span className="text-primary">people</span>, not
                process.
              </h2>

              <p className="text-on_surface_variant">
                Disconnected systems slow down impact. A unified platform helps
                streamline coordination and reduce manual effort.
              </p>

              {/* removed fake stat */}
              <div className="p-6 bg-surface rounded-lg shadow-soft">
                <p className="text-sm text-on_surface_variant">
                  Designed to simplify logistics workflows and improve response
                  coordination across teams.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="py-32 px-6 md:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-outfit font-extrabold">
                Core Capabilities
              </h2>
              <p className="text-on_surface_variant mt-4">
                Tools designed to support efficient coordination and resource
                management.
              </p>
            </div>

            <div className="grid md:grid-cols-12 gap-6">
              <div className="md:col-span-8 bg-surface/60 backdrop-blur-glass p-10 rounded-xl shadow-soft">
                <h3 className="text-3xl font-outfit font-bold mb-4">
                  Resource Matching
                </h3>
                <p className="text-on_surface_variant">
                  Connect available resources with nearby demand efficiently.
                </p>
              </div>

              <div className="md:col-span-4 bg-primary text-white p-10 rounded-xl">
                <h3 className="text-xl font-outfit font-bold">
                  Volunteer Coordination
                </h3>
                <p className="text-sm opacity-80">
                  Assign tasks based on availability and needs.
                </p>
              </div>

              <div className="md:col-span-4 bg-surface/60 backdrop-blur-glass p-8 rounded-xl shadow-soft">
                Transparency Tools
              </div>

              <div className="md:col-span-8 bg-surface_high p-8 rounded-xl shadow-soft">
                Rapid Response Support
              </div>
            </div>
          </div>
        </section>

        {/* ================= DARK ================= */}
        <section className="py-32 px-6 md:px-16 bg-on_surface text-white">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-outfit font-extrabold">
                Building Better Coordination Systems
              </h2>

              <p className="opacity-70">
                Connecting organizations, volunteers, and resources through a
                unified network.
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
                className="w-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="py-32 px-6 text-center">
          <h2 className="text-5xl font-outfit font-extrabold">
            Ready to get started?
          </h2>

          <p className="text-on_surface_variant mt-4">
            Join the platform and start coordinating resources more effectively.
          </p>

          <div className="flex justify-center gap-6 mt-10 flex-wrap">
            <Link className="bg-primaryGradient text-white px-12 py-5 rounded-lg font-bold">
              Get Started
            </Link>

            <Link className="bg-surface_highest text-primary px-12 py-5 rounded-lg font-bold">
              Request Demo
            </Link>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="py-20 px-6 bg-surface_lowest">
        <div className="max-w-7xl mx-auto text-center text-sm text-on_surface_variant">
          © Sahyog Sync — Platform for resource coordination
        </div>
      </footer>
    </div>
  );
};

export default Landing;
