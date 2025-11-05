import { useSettings } from "@/context/SettingsContext";

const Hero = () => {
  const { heroTitle, heroSubtitle, heroImageUrl } = useSettings();
  const scrollToCalendar = () => {
    document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {heroImageUrl ? (
          <img 
            src={heroImageUrl}
            alt="Casa de Praia na barra do sai"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-primary/30 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/20 to-background/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="text-center max-w-5xl mx-auto animate-fade-in px-4">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-xl">
            {heroTitle || "Seu Refúgio à Beira-Mar"}
          </h1>
          <p className="text-lg md:text-2xl text-white/95 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            {heroSubtitle || "Desperte com o som das ondas e relaxe em Itapoá"}
          </p>
          <button 
            onClick={scrollToCalendar}
            className="group inline-flex items-center gap-3 gradient-ocean text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Ver Disponibilidade
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToCalendar}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white animate-bounce cursor-pointer"
        aria-label="Rolar para baixo"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </section>
  );
};

export default Hero;
