import { useRef } from 'react';
import { MapPin } from 'lucide-react';

// Substituído: Mapbox removido em favor de Google Maps embed (sem API key)

const MapSection = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  // Google Maps embed via iframe (gratuito) para o endereço informado

  const nearbyPlaces = [
    { name: 'Praia: 100m', icon: '🏖️' },
    { name: 'Mercado Cotia: 500m', icon: '🛒' },
    { name: 'Restaurantes proximos: 500m', icon: '🍽️' },
    { name: 'Farmácia: 500m', icon: '💊' },
  ];

  return (
    <section id="map" className="py-24 px-4 bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Localização Privilegiada
          </h2>
          <p className="text-xl text-muted-foreground">
            Barra do Sai, Itapoá — bairro tranquilo e próximo da praia
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="card-elevated overflow-hidden h-[500px]">
              <iframe
                title="Mapa - Barra do Sai, Itapoá"
                src={
                  "https://www.google.com/maps?q=" +
                  encodeURIComponent("Barra do Sai, Itapoá, Santa Catarina, Brasil") +
                  "&output=embed"
                }
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>

          {/* Nearby Places */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-6 text-foreground">Pontos de Interesse</h3>
            {nearbyPlaces.map((place, index) => (
              <div
                key={index}
                className="card-elevated p-4 hover-lift"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{place.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{place.name}</h4>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="card-elevated p-6 bg-accent/5 border-accent/20">
              <h4 className="font-semibold mb-2 text-foreground">📍 Bairro</h4>
              <p className="text-sm text-muted-foreground">
                Barra do Sai<br />
                Itapoá, Santa Catarina, Brasil
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
