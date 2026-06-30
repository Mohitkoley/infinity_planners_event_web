"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getLeadsAction,
  createLeadAction,
  updateLeadAction,
  deleteLeadAction,
  getConfigAction,
  getEventTypesAction,
  getEventsAction,
  createEventAction,
  deleteEventAction,
  updateEventAction,
  updateEventTypesAction,
} from "@/app/actions";

interface Lead {
  id: string;
  name: string;
  email: string;
  eventType: string;
  eventDate: string;
  guests: number;
  message: string;
  status: "New" | "Contacted" | "Closed";
  createdTime: string;
  notes?: string;
}

interface EventItem {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  date: string;
  type: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  notes?: string;
  createdTime: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"leads" | "events" | "settings">("leads");

  // Leads state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsSearch, setLeadsSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editStatus, setEditStatus] = useState<"New" | "Contacted" | "Closed">("New");
  const [editNotes, setEditNotes] = useState("");

  // Events state
  const [eventsList, setEventsList] = useState<EventItem[]>([]);
  const [eventsSearch, setEventsSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [editEventStatus, setEditEventStatus] = useState<"Scheduled" | "Completed" | "Cancelled">("Scheduled");
  const [editEventNotes, setEditEventNotes] = useState("");

  // Studio configuration state
  const [studioEmail, setStudioEmail] = useState("hello@infinityplanners.nyc");
  const [studioPhone, setStudioPhone] = useState("+1 (516) 344-7239");
  const [studioAddress, setStudioAddress] = useState("545 Madison Avenue, New York, NY 10022");
  const [studioOffice, setStudioOffice] = useState("Manhattan Office");
  const [eventTypeOptions, setEventTypeOptions] = useState(["Luxury Wedding", "Corporate Gala", "Private Celebration", "Other"]);
  const [draftEventTypes, setDraftEventTypes] = useState(["Luxury Wedding", "Corporate Gala", "Private Celebration", "Other"]);
  const [newEventTypeName, setNewEventTypeName] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Lead modal state
  const [newLeadModalOpen, setNewLeadModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newType, setNewType] = useState("Luxury Wedding");
  const [newDate, setNewDate] = useState("");
  const [newGuests, setNewGuests] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // Event modal state
  const [newEventModalOpen, setNewEventModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventClientName, setEventClientName] = useState("");
  const [eventClientEmail, setEventClientEmail] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("Luxury Wedding");
  const [eventNotes, setEventNotes] = useState("");

  const refreshData = async () => {
    try {
      // 1. Fetch site config
      const configData = await getConfigAction();
      setStudioEmail(configData.email);
      setStudioPhone(configData.phone);
      setStudioAddress(configData.address);
      setStudioOffice(configData.officeName);

      // 2. Fetch event type options from the dedicated event_types table
      const dbEventTypes = await getEventTypesAction();
      setEventTypeOptions(dbEventTypes);
      setDraftEventTypes(dbEventTypes);
      setNewType((currentType) => dbEventTypes.includes(currentType) ? currentType : dbEventTypes[0]);
      setEventType((currentType) => dbEventTypes.includes(currentType) ? currentType : dbEventTypes[0]);

      // 3. Fetch leads
      const dbLeads = await getLeadsAction();
      const mappedLeads: Lead[] = dbLeads.map((l) => ({
        id: l.id,
        name: l.name,
        email: l.email,
        eventType: l.eventType,
        eventDate: l.eventDate,
        guests: l.guests,
        message: l.message || "",
        status: l.status as "New" | "Contacted" | "Closed",
        createdTime: l.createdTime instanceof Date ? l.createdTime.toISOString() : String(l.createdTime),
        notes: l.notes || "",
      }));
      setLeads(mappedLeads);

      // 4. Fetch events
      const dbEvents = await getEventsAction();
      const mappedEvents: EventItem[] = dbEvents.map((ev) => ({
        id: ev.id,
        title: ev.title,
        clientName: ev.clientName,
        clientEmail: ev.clientEmail,
        date: ev.date,
        type: ev.type,
        status: ev.status as "Scheduled" | "Completed" | "Cancelled",
        notes: ev.notes || "",
        createdTime: ev.createdTime instanceof Date ? ev.createdTime.toISOString() : String(ev.createdTime),
      }));
      setEventsList(mappedEvents);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Selection handlers
  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setSelectedEvent(null); // Close event drawer if open
    setEditStatus(lead.status);
    setEditNotes(lead.notes || "");
  };

  const handleSelectEvent = (eventItem: EventItem) => {
    setSelectedEvent(eventItem);
    setSelectedLead(null); // Close lead drawer if open
    setEditEventStatus(eventItem.status);
    setEditEventNotes(eventItem.notes || "");
  };

  // Lead mutations
  const handleUpdateLeadDetails = async () => {
    if (!selectedLead) return;
    try {
      await updateLeadAction(selectedLead.id, editStatus, editNotes);
      setSelectedLead({ ...selectedLead, status: editStatus, notes: editNotes });
      await refreshData();
    } catch (err) {
      console.error("Failed to update lead status:", err);
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await deleteLeadAction(id);
      setSelectedLead(null);
      await refreshData();
    } catch (err) {
      console.error("Failed to delete lead:", err);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    try {
      await createLeadAction({
        name: newName,
        email: newEmail,
        eventType: newType,
        eventDate: newDate || new Date().toISOString().split("T")[0],
        guests: Number(newGuests) || 0,
        message: newMessage,
      });

      setNewName("");
      setNewEmail("");
      setNewType(eventTypeOptions[0]);
      setNewDate("");
      setNewGuests("");
      setNewMessage("");
      setNewLeadModalOpen(false);

      await refreshData();
    } catch (err) {
      console.error("Failed to manually create lead:", err);
    }
  };

  // Event mutations
  const handleUpdateEventDetails = async () => {
    if (!selectedEvent) return;
    try {
      await updateEventAction(selectedEvent.id, editEventStatus, editEventNotes);
      setSelectedEvent({ ...selectedEvent, status: editEventStatus, notes: editEventNotes });
      await refreshData();
    } catch (err) {
      console.error("Failed to update event details:", err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEventAction(id);
      setSelectedEvent(null);
      await refreshData();
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventClientName || !eventClientEmail) return;

    try {
      await createEventAction({
        title: eventTitle,
        clientName: eventClientName,
        clientEmail: eventClientEmail,
        date: eventDate || new Date().toISOString().split("T")[0],
        type: eventType,
        notes: eventNotes,
      });

      setEventTitle("");
      setEventClientName("");
      setEventClientEmail("");
      setEventDate("");
      setEventType(eventTypeOptions[0]);
      setEventNotes("");
      setNewEventModalOpen(false);

      await refreshData();
    } catch (err) {
      console.error("Failed to create event:", err);
    }
  };

  // Filter lists
  const filteredLeads = leads.filter((l) => {
    const q = leadsSearch.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.eventType.toLowerCase().includes(q)
    );
  });

  const filteredEvents = eventsList.filter((ev) => {
    const q = eventsSearch.toLowerCase();
    return (
      ev.title.toLowerCase().includes(q) ||
      ev.clientName.toLowerCase().includes(q) ||
      ev.type.toLowerCase().includes(q)
    );
  });

  // Metric aggregates
  const totalLeads = leads.length;
  const activeProjects = leads.filter((l) => l.status === "Contacted").length;
  const closedRevenue = leads
    .filter((l) => l.status === "Closed")
    .reduce((sum, l) => sum + (l.guests * 0.8), 0); // revenue calculated based on guest budgets
  const formattedRevenue = Math.round(closedRevenue);

  const totalEvents = eventsList.length;
  const scheduledEventsCount = eventsList.filter((e) => e.status === "Scheduled").length;
  const completedEventsCount = eventsList.filter((e) => e.status === "Completed").length;

  const handleLogout = () => {
    router.push("/admin/login");
  };

  const handleAddEventType = () => {
    const trimmedType = newEventTypeName.trim();
    if (!trimmedType || draftEventTypes.includes(trimmedType)) return;

    setDraftEventTypes([...draftEventTypes, trimmedType]);
    setNewEventTypeName("");
    setSettingsSaved(false);
  };

  const handleRemoveEventType = (typeToRemove: string) => {
    if (draftEventTypes.length <= 1) return;

    setDraftEventTypes(draftEventTypes.filter((type) => type !== typeToRemove));
    setSettingsSaved(false);
  };

  const handleSaveEventTypes = async () => {
    try {
      const savedTypes = await updateEventTypesAction(draftEventTypes);
      setEventTypeOptions(savedTypes);
      setDraftEventTypes(savedTypes);
      setNewType((currentType) => savedTypes.includes(currentType) ? currentType : savedTypes[0]);
      setEventType((currentType) => savedTypes.includes(currentType) ? currentType : savedTypes[0]);
      setSettingsSaved(true);
    } catch (err) {
      console.error("Failed to update event types:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background font-body-md flex">
      {/* Side Navigation */}
      <aside className="fixed left-0 top-0 h-full w-60 bg-surface border-r border-outline-variant flex flex-col py-8 px-4 z-40">
        <div className="mb-12 px-4">
          <Link href="/">
            <h1 className="font-headline-sm text-headline-sm text-primary tracking-tight hover:opacity-85 transition-opacity uppercase">
              Infinity Planners
            </h1>
          </Link>
          <p className="text-[10px] uppercase tracking-[0.2em] text-secondary mt-1">Event Software</p>
        </div>
        <nav className="flex-grow space-y-1">
          <button
            onClick={() => {
              setActiveTab("leads");
              setSelectedEvent(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-200 text-left ${
              activeTab === "leads"
                ? "text-primary font-semibold bg-primary-container/10 border-l-2 border-primary"
                : "text-secondary hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === "leads" ? "'FILL' 1" : "" }}>
              leaderboard
            </span>
            <span className="font-nav-link text-nav-link">Leads</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("events");
              setSelectedLead(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-200 text-left ${
              activeTab === "events"
                ? "text-primary font-semibold bg-primary-container/10 border-l-2 border-primary"
                : "text-secondary hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === "events" ? "'FILL' 1" : "" }}>
              event
            </span>
            <span className="font-nav-link text-nav-link">Events</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("settings");
              setSelectedLead(null);
              setSelectedEvent(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-200 text-left ${
              activeTab === "settings"
                ? "text-primary font-semibold bg-primary-container/10 border-l-2 border-primary"
                : "text-secondary hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === "settings" ? "'FILL' 1" : "" }}>
              tune
            </span>
            <span className="font-nav-link text-nav-link">Settings</span>
          </button>
        </nav>
        <div className="mt-auto px-4 space-y-3">
          {activeTab === "leads" && (
            <button
              onClick={() => setNewLeadModalOpen(true)}
              className="w-full py-4 bg-primary-container text-white font-label-caps text-label-caps hover:bg-[#C09B2F] transition-all duration-300 uppercase tracking-widest cursor-pointer"
            >
              New Lead
            </button>
          )}
          {activeTab === "events" && (
            <button
              onClick={() => setNewEventModalOpen(true)}
              className="w-full py-4 bg-primary text-white font-label-caps text-label-caps hover:bg-[#C09B2F] transition-all duration-300 uppercase tracking-widest cursor-pointer"
            >
              New Event
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full py-3 border border-outline-variant text-secondary font-label-caps text-label-caps hover:border-error hover:text-error transition-all duration-300 uppercase tracking-widest cursor-pointer"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-60 flex-grow min-h-screen flex flex-col relative">
        {/* Top Header */}
        <header className="sticky top-0 h-20 bg-surface/85 backdrop-blur-md border-b border-outline-variant flex items-center justify-between px-8 z-30">
          <div className="flex items-center gap-4">
            <h2 className="font-headline-sm text-headline-sm text-primary uppercase tracking-wider">
              {activeTab === "leads"
                ? "Leads Management"
                : activeTab === "events"
                ? "Events Scheduling"
                : "Site Settings"}
            </h2>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[16px]">
                search
              </span>
              <input
                className="bg-surface-container border-none py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary w-64 transition-all focus:w-80 rounded-none text-on-surface"
                placeholder={activeTab === "leads" ? "Search leads..." : "Search scheduled events..."}
                type="text"
                value={activeTab === "leads" ? leadsSearch : activeTab === "events" ? eventsSearch : ""}
                onChange={(e) => activeTab === "leads" ? setLeadsSearch(e.target.value) : activeTab === "events" ? setEventsSearch(e.target.value) : undefined}
                disabled={activeTab === "settings"}
              />
            </div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right">
                <p className="font-label-caps text-[10px] text-primary uppercase tracking-wider">Administrator</p>
                <p className="font-sans text-xs text-on-surface font-semibold group-hover:text-primary transition-colors">Infinity Curator</p>
              </div>
              <div className="w-10 h-10 border border-outline-variant p-0.5 bg-white">
                <div className="w-full h-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt="Administrator Profile"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlie86kx7tWiScssWI5sO1bw2Vp5JHUmb721P4wImy8pVUbHRMeZqnc_iOQTzhQLhNBVcW8GcyE3mJrbG0TwpO-gGGWq99uJKe-ZJJBdUWk5n2QQcoYoIrmkZOwVyLxRXthGI4BZ0A35Jczd5A3WYb6sOWRZ1u3F-TehoG04aunMi2AGaklKhWi7dKz7CMsAHiP1gEbXrgZqGgSRxJalncqtE2ofw0D7ps_S4w682OXwmpRhQqJ2SavLej3GH2EwE0T5kGE41k2I8"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="p-8 flex-grow">
          <div className="max-w-container-max mx-auto space-y-8">
            
            {/* CONDITIONAL LEADS VIEW */}
            {activeTab === "leads" && (
              <>
                {/* Leads Key Metrics Row */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                  <div className="bg-surface border border-outline-variant p-8 flex flex-col justify-between hover:border-primary-container transition-all duration-500 hover:-translate-y-0.5 shadow-sm hover:shadow-md">
                    <p className="font-label-caps text-label-caps text-secondary mb-4 uppercase tracking-[0.2em]">Total Leads</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-display-lg text-[42px] leading-tight text-on-surface">{totalLeads}</h3>
                      <span className="text-status-contacted text-xs font-bold font-inter">+12%</span>
                    </div>
                    <div className="mt-4 h-[2px] w-full bg-surface-container overflow-hidden">
                      <div className="h-full bg-primary-container transition-all duration-1000" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                  <div className="bg-surface border border-outline-variant p-8 flex flex-col justify-between hover:border-primary-container transition-all duration-500 hover:-translate-y-0.5 shadow-sm hover:shadow-md">
                    <p className="font-label-caps text-label-caps text-secondary mb-4 uppercase tracking-[0.2em]">Active Projects</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-display-lg text-[42px] leading-tight text-on-surface">{activeProjects}</h3>
                      <span className="text-secondary text-xs font-bold font-inter">Live</span>
                    </div>
                    <div className="mt-4 h-[2px] w-full bg-surface-container overflow-hidden">
                      <div className="h-full bg-deep-charcoal transition-all duration-1000" style={{ width: "45%" }}></div>
                    </div>
                  </div>
                  <div className="bg-surface border border-outline-variant p-8 flex flex-col justify-between hover:border-primary-container transition-all duration-500 hover:-translate-y-0.5 shadow-sm hover:shadow-md">
                    <p className="font-label-caps text-label-caps text-secondary mb-4 uppercase tracking-[0.2em]">Closed Revenue</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-display-lg text-[42px] leading-tight text-on-surface">${formattedRevenue}k</h3>
                      <span className="text-status-contacted text-xs font-bold font-inter">+8%</span>
                    </div>
                    <div className="mt-4 h-[2px] w-full bg-surface-container overflow-hidden">
                      <div className="h-full bg-primary-container transition-all duration-1000" style={{ width: "65%" }}></div>
                    </div>
                  </div>
                </section>

                {/* Leads List and Detail Drawer */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-gutter items-start">
                  {/* Recent Inquiries List */}
                  <section className="xl:col-span-2 bg-surface border border-outline-variant overflow-hidden">
                    <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-white">
                      <h4 className="font-headline-sm text-headline-sm text-on-surface">Recent Inquiries</h4>
                      <span className="font-label-caps text-[10px] text-secondary uppercase tracking-wider">
                        {filteredLeads.length} Items Listed
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-outline-variant bg-surface-container-low">
                            <th className="p-4 font-label-caps text-[10px] text-secondary uppercase tracking-widest">Client</th>
                            <th className="p-4 font-label-caps text-[10px] text-secondary uppercase tracking-widest">Event Detail</th>
                            <th className="p-4 font-label-caps text-[10px] text-secondary uppercase tracking-widest">Status</th>
                            <th className="p-4 font-label-caps text-[10px] text-secondary uppercase tracking-widest text-right">Inquiry Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLeads.length > 0 ? (
                            filteredLeads.map((lead) => (
                              <tr
                                key={lead.id}
                                onClick={() => handleSelectLead(lead)}
                                className={`border-b border-outline-variant/60 hover:bg-surface-container-low transition-colors cursor-pointer ${
                                  selectedLead?.id === lead.id ? "bg-primary-container/5" : ""
                                }`}
                              >
                                <td className="p-4">
                                  <p className="font-sans text-sm font-semibold text-on-surface">{lead.name}</p>
                                  <p className="font-mono text-[11px] text-secondary">{lead.email}</p>
                                </td>
                                <td className="p-4">
                                  <span className="font-serif text-sm italic text-on-surface">{lead.eventType}</span>
                                  <span className="text-secondary text-[11px] font-sans block">
                                    {lead.eventDate} &middot; {lead.guests} Guests
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span
                                    className={`inline-block px-2.5 py-0.5 text-[9px] font-label-caps uppercase tracking-wider ${
                                      lead.status === "New"
                                        ? "bg-status-new/10 text-status-new"
                                        : lead.status === "Contacted"
                                        ? "bg-status-pending/10 text-status-pending"
                                        : "bg-status-contacted/10 text-status-contacted"
                                    }`}
                                  >
                                    {lead.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right font-mono text-[11px] text-secondary">
                                  {new Date(lead.createdTime).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="p-12 text-center text-secondary font-light text-sm">
                                No lead records match the search filter.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Sidebar Detail Drawer */}
                  <aside className="xl:col-span-1 space-y-6">
                    {selectedLead ? (
                      <section className="bg-surface border border-outline-variant p-8 space-y-6">
                        <div className="flex justify-between items-start border-b border-outline-variant pb-6">
                          <div>
                            <span className="font-label-caps text-[10px] text-primary uppercase tracking-widest block mb-1">
                              Lead Detail
                            </span>
                            <h4 className="font-headline-sm text-headline-sm text-on-surface">{selectedLead.name}</h4>
                            <p className="font-mono text-xs text-secondary mt-1">{selectedLead.email}</p>
                          </div>
                          <button
                            onClick={() => setSelectedLead(null)}
                            className="text-secondary hover:text-primary transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                          </button>
                        </div>

                        <div className="space-y-4 text-sm leading-relaxed">
                          <div>
                            <p className="font-label-caps text-[10px] text-secondary uppercase tracking-wider mb-1">Staging Goal</p>
                            <p className="text-on-surface font-semibold font-serif italic">{selectedLead.eventType}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="font-label-caps text-[10px] text-secondary uppercase tracking-wider mb-1">Date</p>
                              <p className="text-on-surface font-semibold">{selectedLead.eventDate}</p>
                            </div>
                            <div>
                              <p className="font-label-caps text-[10px] text-secondary uppercase tracking-wider mb-1">Guests</p>
                              <p className="text-on-surface font-semibold">{selectedLead.guests} Attendees</p>
                            </div>
                          </div>
                          {selectedLead.message && (
                            <div>
                              <p className="font-label-caps text-[10px] text-secondary uppercase tracking-wider mb-1">Inquiry Vision</p>
                              <p className="text-secondary bg-surface-container-low p-4 border border-outline-variant/60 font-light italic text-xs leading-relaxed">
                                "{selectedLead.message}"
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-outline-variant/60 space-y-4">
                          <div>
                            <label className="font-label-caps text-[10px] text-secondary uppercase tracking-wider block mb-2">
                              Lead Status
                            </label>
                            <select
                              className="w-full bg-transparent border border-outline-variant py-2.5 px-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm rounded-none text-on-surface cursor-pointer"
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value as any)}
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted (Active)</option>
                              <option value="Closed">Closed (Confirmed)</option>
                            </select>
                          </div>

                          <div>
                            <label className="font-label-caps text-[10px] text-secondary uppercase tracking-wider block mb-2">
                              Internal Notes
                            </label>
                            <textarea
                              className="w-full bg-transparent border border-outline-variant p-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm rounded-none text-on-surface resize-none"
                              placeholder="Add curator notes here..."
                              rows={4}
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                            ></textarea>
                          </div>

                          <div className="flex gap-4 pt-2">
                            <button
                              onClick={handleUpdateLeadDetails}
                              className="flex-grow py-3.5 bg-deep-charcoal text-white font-label-caps text-label-caps hover:bg-primary transition-all duration-300 uppercase tracking-widest cursor-pointer text-center font-semibold"
                            >
                              Save Notes/Status
                            </button>
                            <button
                              onClick={() => handleDeleteLead(selectedLead.id)}
                              className="px-4 py-3.5 border border-error text-error font-label-caps text-label-caps hover:bg-error hover:text-white transition-all duration-300 uppercase tracking-widest cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </section>
                    ) : (
                      <StudioDetailsPanel
                        email={studioEmail}
                        phone={studioPhone}
                        address={studioAddress}
                        officeName={studioOffice}
                      />
                    )}
                  </aside>
                </div>
              </>
            )}

            {/* CONDITIONAL EVENTS VIEW */}
            {activeTab === "events" && (
              <>
                {/* Events Key Metrics Row */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                  <div className="bg-surface border border-outline-variant p-8 flex flex-col justify-between hover:border-primary transition-all duration-500 hover:-translate-y-0.5 shadow-sm hover:shadow-md">
                    <p className="font-label-caps text-label-caps text-secondary mb-4 uppercase tracking-[0.2em]">Total Scheduled</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-display-lg text-[42px] leading-tight text-on-surface">{totalEvents}</h3>
                      <span className="text-status-pending text-xs font-bold font-inter">Live Staging</span>
                    </div>
                    <div className="mt-4 h-[2px] w-full bg-surface-container overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-1000" style={{ width: "80%" }}></div>
                    </div>
                  </div>
                  <div className="bg-surface border border-outline-variant p-8 flex flex-col justify-between hover:border-primary transition-all duration-500 hover:-translate-y-0.5 shadow-sm hover:shadow-md">
                    <p className="font-label-caps text-label-caps text-secondary mb-4 uppercase tracking-[0.2em]">Active Pipeline</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-display-lg text-[42px] leading-tight text-on-surface">{scheduledEventsCount}</h3>
                      <span className="text-secondary text-xs font-bold font-inter">Scheduled</span>
                    </div>
                    <div className="mt-4 h-[2px] w-full bg-surface-container overflow-hidden">
                      <div className="h-full bg-deep-charcoal transition-all duration-1000" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                  <div className="bg-surface border border-outline-variant p-8 flex flex-col justify-between hover:border-primary transition-all duration-500 hover:-translate-y-0.5 shadow-sm hover:shadow-md">
                    <p className="font-label-caps text-label-caps text-secondary mb-4 uppercase tracking-[0.2em]">Completed Events</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-display-lg text-[42px] leading-tight text-on-surface">{completedEventsCount}</h3>
                      <span className="text-status-contacted text-xs font-bold font-inter">Delivered</span>
                    </div>
                    <div className="mt-4 h-[2px] w-full bg-surface-container overflow-hidden">
                      <div className="h-full bg-status-contacted transition-all duration-1000" style={{ width: "40%" }}></div>
                    </div>
                  </div>
                </section>

                {/* Events List and Detail Drawer */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-gutter items-start">
                  {/* Scheduled Events List Card */}
                  <section className="xl:col-span-2 bg-surface border border-outline-variant overflow-hidden">
                    <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-white">
                      <h4 className="font-headline-sm text-headline-sm text-on-surface">Scheduled Events</h4>
                      <span className="font-label-caps text-[10px] text-secondary uppercase tracking-wider">
                        {filteredEvents.length} Events Listed
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-outline-variant bg-surface-container-low">
                            <th className="p-4 font-label-caps text-[10px] text-secondary uppercase tracking-widest">Event Title</th>
                            <th className="p-4 font-label-caps text-[10px] text-secondary uppercase tracking-widest">Client Details</th>
                            <th className="p-4 font-label-caps text-[10px] text-secondary uppercase tracking-widest">Type</th>
                            <th className="p-4 font-label-caps text-[10px] text-secondary uppercase tracking-widest">Status</th>
                            <th className="p-4 font-label-caps text-[10px] text-secondary uppercase tracking-widest text-right">Event Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEvents.length > 0 ? (
                            filteredEvents.map((eventItem) => (
                              <tr
                                key={eventItem.id}
                                onClick={() => handleSelectEvent(eventItem)}
                                className={`border-b border-outline-variant/60 hover:bg-surface-container-low transition-colors cursor-pointer ${
                                  selectedEvent?.id === eventItem.id ? "bg-primary-container/5" : ""
                                }`}
                              >
                                <td className="p-4">
                                  <p className="font-sans text-sm font-semibold text-on-surface">{eventItem.title}</p>
                                  <span className="font-mono text-[10px] text-secondary uppercase tracking-wide">ID: {eventItem.id.substring(0, 8)}</span>
                                </td>
                                <td className="p-4">
                                  <p className="font-sans text-sm text-on-surface">{eventItem.clientName}</p>
                                  <p className="font-mono text-[11px] text-secondary">{eventItem.clientEmail}</p>
                                </td>
                                <td className="p-4 text-serif italic text-sm text-on-surface">
                                  {eventItem.type}
                                </td>
                                <td className="p-4">
                                  <span
                                    className={`inline-block px-2.5 py-0.5 text-[9px] font-label-caps uppercase tracking-wider ${
                                      eventItem.status === "Scheduled"
                                        ? "bg-status-pending/10 text-status-pending"
                                        : eventItem.status === "Completed"
                                        ? "bg-status-contacted/10 text-status-contacted"
                                        : "bg-status-new/10 text-status-new"
                                    }`}
                                  >
                                    {eventItem.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right font-mono text-sm text-on-surface font-semibold">
                                  {eventItem.date}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="p-12 text-center text-secondary font-light text-sm">
                                No events found matching the search filter.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Sidebar Detail Drawer */}
                  <aside className="xl:col-span-1 space-y-6">
                    {selectedEvent ? (
                      <section className="bg-surface border border-outline-variant p-8 space-y-6">
                        <div className="flex justify-between items-start border-b border-outline-variant pb-6">
                          <div>
                            <span className="font-label-caps text-[10px] text-primary uppercase tracking-widest block mb-1">
                              Event Details
                            </span>
                            <h4 className="font-headline-sm text-headline-sm text-on-surface">{selectedEvent.title}</h4>
                            <p className="font-mono text-xs text-secondary mt-1">Client: {selectedEvent.clientName}</p>
                          </div>
                          <button
                            onClick={() => setSelectedEvent(null)}
                            className="text-secondary hover:text-primary transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                          </button>
                        </div>

                        <div className="space-y-4 text-sm leading-relaxed">
                          <div>
                            <p className="font-label-caps text-[10px] text-secondary uppercase tracking-wider mb-1">Event Type</p>
                            <p className="text-on-surface font-semibold font-serif italic">{selectedEvent.type}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="font-label-caps text-[10px] text-secondary uppercase tracking-wider mb-1">Date</p>
                              <p className="text-on-surface font-semibold">{selectedEvent.date}</p>
                            </div>
                            <div>
                              <p className="font-label-caps text-[10px] text-secondary uppercase tracking-wider mb-1">Client Email</p>
                              <p className="text-on-surface font-mono text-xs overflow-hidden text-ellipsis">{selectedEvent.clientEmail}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-outline-variant/60 space-y-4">
                          <div>
                            <label className="font-label-caps text-[10px] text-secondary uppercase tracking-wider block mb-2">
                              Event Status
                            </label>
                            <select
                              className="w-full bg-transparent border border-outline-variant py-2.5 px-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm rounded-none text-on-surface cursor-pointer"
                              value={editEventStatus}
                              onChange={(e) => setEditEventStatus(e.target.value as any)}
                            >
                              <option value="Scheduled">Scheduled</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>

                          <div>
                            <label className="font-label-caps text-[10px] text-secondary uppercase tracking-wider block mb-2">
                              Curator Production Notes
                            </label>
                            <textarea
                              className="w-full bg-transparent border border-outline-variant p-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm rounded-none text-on-surface resize-none"
                              placeholder="Add event production details..."
                              rows={4}
                              value={editEventNotes}
                              onChange={(e) => setEditEventNotes(e.target.value)}
                            ></textarea>
                          </div>

                          <div className="flex gap-4 pt-2">
                            <button
                              onClick={handleUpdateEventDetails}
                              className="flex-grow py-3.5 bg-deep-charcoal text-white font-label-caps text-label-caps hover:bg-primary transition-all duration-300 uppercase tracking-widest cursor-pointer text-center font-semibold"
                            >
                              Save Production
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(selectedEvent.id)}
                              className="px-4 py-3.5 border border-error text-error font-label-caps text-label-caps hover:bg-error hover:text-white transition-all duration-300 uppercase tracking-widest cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </section>
                    ) : (
                      <StudioDetailsPanel
                        email={studioEmail}
                        phone={studioPhone}
                        address={studioAddress}
                        officeName={studioOffice}
                      />
                    )}
                  </aside>
                </div>
              </>
            )}

            {/* CONDITIONAL SETTINGS VIEW */}
            {activeTab === "settings" && (
              <section className="grid grid-cols-1 xl:grid-cols-3 gap-gutter items-start">
                <div className="xl:col-span-2 bg-surface border border-outline-variant p-8">
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-outline-variant pb-6 mb-8">
                    <div>
                      <span className="font-label-caps text-[10px] text-primary uppercase tracking-widest block mb-2">
                        Public Form Configuration
                      </span>
                      <h3 className="font-headline-md text-3xl text-deep-charcoal uppercase tracking-wider">
                        Event Types
                      </h3>
                    </div>
                    <button
                      onClick={handleSaveEventTypes}
                      className="px-6 py-3 bg-primary text-white font-label-caps text-label-caps hover:bg-deep-charcoal transition-all duration-300 uppercase tracking-widest cursor-pointer"
                    >
                      Save Types
                    </button>
                  </div>

                  <div className="space-y-4">
                    {draftEventTypes.map((type) => (
                      <div
                        key={type}
                        className="flex items-center justify-between border border-outline-variant bg-white px-4 py-3"
                      >
                        <span className="font-serif text-base italic text-on-surface">{type}</span>
                        <button
                          onClick={() => handleRemoveEventType(type)}
                          disabled={draftEventTypes.length <= 1}
                          className="text-secondary hover:text-error disabled:opacity-30 disabled:hover:text-secondary transition-colors cursor-pointer disabled:cursor-not-allowed"
                          aria-label={`Remove ${type}`}
                        >
                          <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
                    <input
                      className="w-full bg-transparent border border-outline-variant py-3 px-4 focus:ring-1 focus:ring-primary focus:border-primary text-sm rounded-none text-on-surface"
                      placeholder="Add a new event type"
                      value={newEventTypeName}
                      onChange={(e) => {
                        setNewEventTypeName(e.target.value);
                        setSettingsSaved(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddEventType();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddEventType}
                      className="px-6 py-3 border border-primary text-primary font-label-caps text-label-caps hover:bg-primary hover:text-white transition-all duration-300 uppercase tracking-widest cursor-pointer"
                    >
                      Add Type
                    </button>
                  </div>

                  {settingsSaved && (
                    <p className="mt-5 font-label-caps text-[10px] text-status-contacted uppercase tracking-widest">
                      Event types saved and applied to public/admin forms.
                    </p>
                  )}
                </div>

                <aside className="xl:col-span-1">
                  <section className="bg-deep-charcoal p-8 text-off-white">
                    <p className="font-label-caps text-label-caps text-outline-variant mb-2 uppercase tracking-widest">
                      Live Options
                    </p>
                    <h4 className="font-headline-sm text-headline-sm mb-4 italic text-primary-container">
                      {eventTypeOptions.length} Active Types
                    </h4>
                    <p className="text-sm text-outline-variant leading-relaxed">
                      These values populate the landing inquiry form, manual lead creation, and event scheduling dropdowns.
                    </p>
                  </section>
                </aside>
              </section>
            )}

          </div>
        </main>
      </div>

      {/* 1. New Lead Modal Dialog */}
      {newLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setNewLeadModalOpen(false)}
          ></div>
          <div className="relative bg-white border border-outline-variant p-8 md:p-10 w-full max-w-lg shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] z-10 rounded-none animate-fade-in text-on-surface">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="font-label-caps text-[10px] text-primary uppercase tracking-widest block mb-1">
                  Creation Panel
                </span>
                <h3 className="font-headline-md text-2xl text-deep-charcoal uppercase tracking-wider">Add Event Lead</h3>
              </div>
              <button
                onClick={() => setNewLeadModalOpen(false)}
                className="text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps text-[10px] text-secondary uppercase tracking-wider block mb-2">
                    Client Name
                  </label>
                  <input
                    className="w-full bg-transparent border border-outline-variant py-2.5 px-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm rounded-none text-on-surface"
                    placeholder="E.g., Julianne Vane"
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-label-caps text-[10px] text-secondary uppercase tracking-wider block mb-2">
                    Client Email
                  </label>
                  <input
                    className="w-full bg-transparent border border-outline-variant py-2.5 px-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm rounded-none text-on-surface"
                    placeholder="email@example.com"
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps text-[10px] text-secondary uppercase tracking-wider block mb-2">
                    Event Type
                  </label>
                  <select
                    className="w-full bg-transparent border border-outline-variant py-2.5 px-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm rounded-none text-on-surface cursor-pointer"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                  >
                    {eventTypeOptions.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-label-caps text-[10px] text-secondary uppercase tracking-wider block mb-2">
                    Event Date
                  </label>
                  <input
                    className="w-full bg-transparent border border-outline-variant py-2.5 px-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm rounded-none text-on-surface"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="font-label-caps text-[10px] text-secondary uppercase tracking-wider block mb-2">
                    Guests Count
                  </label>
                  <input
                    className="w-full bg-transparent border border-outline-variant py-2.5 px-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm rounded-none text-on-surface"
                    placeholder="E.g., 150"
                    type="number"
                    value={newGuests}
                    onChange={(e) => setNewGuests(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="font-label-caps text-[10px] text-secondary uppercase tracking-wider block mb-2">
                  Client Message / Vision
                </label>
                <textarea
                  className="w-full bg-transparent border border-outline-variant p-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm rounded-none text-on-surface resize-none"
                  placeholder="Describe details of the event architecture..."
                  rows={3}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                ></textarea>
              </div>

              <button
                className="w-full py-4 bg-deep-charcoal text-white font-label-caps text-label-caps tracking-widest hover:bg-primary transition-all duration-300 uppercase cursor-pointer text-xs"
                type="submit"
              >
                Create Lead
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. New Event Modal Dialog */}
      {newEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setNewEventModalOpen(false)}
          ></div>
          <div className="relative bg-white border border-outline-variant p-8 md:p-10 w-full max-w-lg shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] z-10 rounded-none animate-fade-in text-on-surface">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="font-label-caps text-[10px] text-primary uppercase tracking-widest block mb-1">
                  Scheduler Panel
                </span>
                <h3 className="font-headline-md text-2xl text-deep-charcoal uppercase tracking-wider">Schedule New Event</h3>
              </div>
              <button
                onClick={() => setNewEventModalOpen(false)}
                className="text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-6">
              <div>
                <label className="font-label-caps text-[10px] text-secondary uppercase tracking-wider block mb-2">
                  Event Title
                </label>
                <input
                  className="w-full bg-transparent border border-outline-variant py-2.5 px-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm rounded-none text-on-surface"
                  placeholder="E.g., Goldman Sachs Q4 Dinner"
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps text-[10px] text-secondary uppercase tracking-wider block mb-2">
                    Client Name
                  </label>
                  <input
                    className="w-full bg-transparent border border-outline-variant py-2.5 px-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm rounded-none text-on-surface"
                    placeholder="E.g., Marcus Vance"
                    type="text"
                    required
                    value={eventClientName}
                    onChange={(e) => setEventClientName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-label-caps text-[10px] text-secondary uppercase tracking-wider block mb-2">
                    Client Email
                  </label>
                  <input
                    className="w-full bg-transparent border border-outline-variant py-2.5 px-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm rounded-none text-on-surface"
                    placeholder="email@example.com"
                    type="email"
                    required
                    value={eventClientEmail}
                    onChange={(e) => setEventClientEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps text-[10px] text-secondary uppercase tracking-wider block mb-2">
                    Event Type
                  </label>
                  <select
                    className="w-full bg-transparent border border-outline-variant py-2.5 px-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm rounded-none text-on-surface cursor-pointer"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                  >
                    {eventTypeOptions.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-label-caps text-[10px] text-secondary uppercase tracking-wider block mb-2">
                    Event Date
                  </label>
                  <input
                    className="w-full bg-transparent border border-outline-variant py-2.5 px-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm rounded-none text-on-surface"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="font-label-caps text-[10px] text-secondary uppercase tracking-wider block mb-2">
                  Production / Staging Notes
                </label>
                <textarea
                  className="w-full bg-transparent border border-outline-variant p-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm rounded-none text-on-surface resize-none"
                  placeholder="Describe scheduled staging specifications..."
                  rows={3}
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                ></textarea>
              </div>

              <button
                className="w-full py-4 bg-primary text-white font-label-caps text-label-caps tracking-widest hover:bg-deep-charcoal transition-all duration-300 uppercase cursor-pointer text-xs"
                type="submit"
              >
                Schedule Event
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent: Studio details side panel
function StudioDetailsPanel({ email, phone, address, officeName }: { email: string; phone: string; address: string; officeName: string }) {
  return (
    <div className="space-y-6">
      <section className="bg-surface border border-outline-variant p-8">
        <h4 className="font-headline-sm text-headline-sm text-on-surface mb-6">Studio Details</h4>
        <div className="space-y-6">
          <div>
            <p className="font-label-caps text-label-caps text-secondary mb-2 uppercase">Contact</p>
            <p className="text-on-surface font-semibold text-sm">{email}</p>
            <p className="text-on-surface text-sm">{phone}</p>
          </div>
          <div>
            <p className="font-label-caps text-label-caps text-secondary mb-2 uppercase">Address</p>
            <p className="text-on-surface text-sm leading-relaxed whitespace-pre-line">
              {address}
            </p>
          </div>
          <div>
            <p className="font-label-caps text-label-caps text-secondary mb-2 uppercase">Location Name</p>
            <p className="text-on-surface text-sm font-semibold">{officeName}</p>
          </div>
          <div className="pt-4 border-t border-outline-variant/60">
            <div className="relative h-40 bg-surface-container-highest mb-4 overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 border border-outline-variant">
              <img
                className="w-full h-full object-cover"
                alt="Manhattan Office"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwDQ3ClPWoAq3z21db_ezdaxdo4lLljUATLYFPLXAYsiDa2CWPujtb7k3GeFa2-k89l-QgnE9h5h_7dFs6SHaXOJC_iJF9tv-83G3hyUVGXjSpL4qJcaR55V7sx6EV4ZzcwFM1q4tqxSaHLTufKfsJHEcOTGV_nOvfhOw036q8rt9sksFUou-pFBvsBreJx8f65eLTVsUcdhqbfIna_xa6rnpx1sLgmc70RovcIqSWB2JJ7gi7wl7S_ZJIC3I7Zi35tIFD6wXWXN8"
              />
              <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  location_on
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center text-[11px] text-secondary font-mono">
              <span>Lat: 40.7589</span>
              <span>Long: -73.9855</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-deep-charcoal p-8 text-off-white">
        <p className="font-label-caps text-label-caps text-outline-variant mb-2 uppercase tracking-widest">Efficiency Goal</p>
        <h5 className="font-headline-sm text-headline-sm mb-4 italic text-primary-container">
          The Art of Precision
        </h5>
        <p className="text-sm text-outline-variant leading-relaxed">
          Maintaining a response time under 2 hours for premium inquiries is our standard for Q4.
        </p>
        <Link
          href="/"
          className="mt-6 flex items-center gap-2 text-primary-container font-bold group hover:underline text-sm uppercase tracking-wider"
        >
          <span>Visit Landing Page</span>
          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </Link>
      </section>
    </div>
  );
}
