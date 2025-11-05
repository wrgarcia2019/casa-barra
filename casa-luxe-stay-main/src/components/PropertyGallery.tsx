import bedroomImage from "@/assets/bedroom-interior.jpg";
import kitchenImage from "@/assets/kitchen-interior.jpg";
import livingRoomImage from "@/assets/living-room.jpg";
import poolImage from "@/assets/pool-area.jpg";
import bathroomImage from "@/assets/bathroom.jpg";
import { useSettings } from "@/context/SettingsContext";

const defaultItems = [
  { imageUrl: livingRoomImage, title: "Sala de Estar", description: "Espaço amplo com tv de 55 polegadas" },
  { imageUrl: bedroomImage, title: "Suíte Master", description: "Conm ar condicionado, uma cama de casal" },
  { imageUrl: kitchenImage, title: "Cozinha Equipada", description: "Equipada para dez pessoas" },
  { imageUrl: poolImage, title: "Área com churrasqueira", description: "Um local para fazer um churrasco" },
  { imageUrl: bathroomImage, title: "3 banheiros completos", description: "dois banheiros sociais e um na suite" },
];

const PropertyGallery = () => {
  const { galleryItems } = useSettings();
  const items = galleryItems.length ? galleryItems : defaultItems;
  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Conheça os Ambientes
          </h2>
          <p className="text-xl text-muted-foreground">
            Bem equipada para familia
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover-lift cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-white/90 text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyGallery;
