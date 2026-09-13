import { Metadata } from "next";
import { getPublicEvents } from "@/lib/services/event.service";
import { Calendar, Sparkles, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Department Events | St. Berchmans College AI & Data Science",
  description:
    "Official events calendar, workshops, guest lectures, and seminars hosted by the Department of AI & Data Science.",
};

export default async function EventsPage() {
  const events = await getPublicEvents().catch(() => []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* HEADER SECTION */}
      <section className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFEAE3] text-[#1C1917] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#756860]" />
          Department Calendar &bull; St. Berchmans College
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-heading text-[#1C1917] tracking-tight">
          Department Events & Seminars
        </h1>
        <p className="text-lg text-[#756860] leading-relaxed">
          Official academic events, workshops, technical symposiums, and guest lectures organized by the Department of Artificial Intelligence & Data Science.
        </p>
      </section>

      {/* EVENTS GRID */}
      <section>
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event: { id: string; title: string; description: string; eventDate: Date; location: string | null; imageUrl: string | null }) => (
              <div
                key={event.id}
                className="bg-white rounded-3xl border border-[#EFEAE3] shadow-xs p-8 space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {event.imageUrl && (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-44 rounded-2xl object-cover border border-[#EFEAE3]"
                    />
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#1C1917]">
                      <Calendar className="w-4 h-4 text-[#FDB27C]" />
                      <span>
                        {new Date(event.eventDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold font-heading text-[#1C1917]">
                      {event.title}
                    </h2>
                    <p className="text-xs text-[#756860] leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>

                {event.location && (
                  <div className="pt-4 border-t border-[#EFEAE3] flex items-center gap-1.5 text-xs text-[#756860]">
                    <MapPin className="w-3.5 h-3.5 text-[#1C1917]" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 sm:p-16 rounded-3xl bg-white border border-[#EFEAE3] text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#FBF9F7] border border-[#EFEAE3] text-[#756860] flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8 opacity-50" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-heading text-[#1C1917]">
                No Upcoming Events Published Yet
              </h2>
              <p className="text-sm text-[#756860]">
                Official department announcements and academic events will be published here by administration.
              </p>
            </div>
            <p className="text-xs text-[#756860] bg-[#FBF9F7] p-3 rounded-xl border border-[#EFEAE3]">
              Department events are published and managed via the Admin CMS.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
