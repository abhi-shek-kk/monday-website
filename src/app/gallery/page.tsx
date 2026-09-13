import { Metadata } from "next";
import Image from "next/image";
import { getPublicGalleryItems } from "@/lib/services/gallery.service";
import { Sparkles, Camera } from "lucide-react";

export const metadata: Metadata = {
  title: "Department Gallery | St. Berchmans College AI & Data Science",
  description:
    "Photo gallery and media showcase for the Department of Artificial Intelligence & Data Science at St. Berchmans College.",
};

const staticGalleryItems = [
  {
    id: "static-1",
    imageUrl: "/images/gallery/campus-activity-1.jpg",
    caption: "St. Berchmans College Campus Activity",
  },
  {
    id: "static-2",
    imageUrl: "/images/gallery/campus-activity-2.jpg",
    caption: "Academic Department Showcase",
  },
  {
    id: "static-3",
    imageUrl: "/images/gallery/campus-activity-3.jpg",
    caption: "Department Campus Snapshot",
  },
];

export default async function GalleryPage() {
  const dbGalleryItems = await getPublicGalleryItems().catch(() => []);
  const allGalleryItems = [...staticGalleryItems, ...dbGalleryItems];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* HEADER SECTION */}
      <section className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFEAE3] text-[#1C1917] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#756860]" />
          Media Showcase &bull; St. Berchmans College
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-heading text-[#1C1917] tracking-tight">
          Department Gallery
        </h1>
        <p className="text-lg text-[#756860] leading-relaxed">
          Visual record of academic lectures, lab activities, technical workshops, and department highlights.
        </p>
      </section>

      {/* GALLERY GRID */}
      <section>
        {allGalleryItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allGalleryItems.map((item: { id: string; imageUrl: string; caption: string | null }) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-[#EFEAE3] shadow-xs overflow-hidden group space-y-3 p-3"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#FBF9F7]">
                  <Image
                    src={item.imageUrl}
                    alt={item.caption || "Department Gallery Item"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {item.caption && (
                  <p className="text-xs text-[#1C1917] font-medium px-2 pb-1">
                    {item.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 sm:p-16 rounded-3xl bg-white border border-[#EFEAE3] text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#FBF9F7] border border-[#EFEAE3] text-[#756860] flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8 opacity-50" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-heading text-[#1C1917]">
                Gallery Updating
              </h2>
              <p className="text-sm text-[#756860]">
                Gallery content will appear here as department activities and photos are added.
              </p>
            </div>
            <p className="text-xs text-[#756860] bg-[#FBF9F7] p-3 rounded-xl border border-[#EFEAE3]">
              Photo uploads are managed by approved students, faculty, and administrators.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
