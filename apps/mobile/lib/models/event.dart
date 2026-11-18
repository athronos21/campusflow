class CampusEvent {
  final String id;
  final String campusId;
  final String title;
  final String description;
  final String venue;
  final String startsAt;
  final String? endsAt;
  final String category;
  final int entryFeeMinor;
  final String currency;
  final int? maxAttendees;
  final String? bannerUrl;
  final String? organizerName;
  final int rsvpCount;

  CampusEvent({
    required this.id,
    required this.campusId,
    required this.title,
    required this.description,
    required this.venue,
    required this.startsAt,
    this.endsAt,
    required this.category,
    required this.entryFeeMinor,
    required this.currency,
    this.maxAttendees,
    this.bannerUrl,
    this.organizerName,
    required this.rsvpCount,
  });

  factory CampusEvent.fromJson(Map<String, dynamic> json) {
    return CampusEvent(
      id: json['id'],
      campusId: json['campusId'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      venue: json['venue'] ?? '',
      startsAt: json['startsAt'] ?? '',
      endsAt: json['endsAt'],
      category: json['category'] ?? 'Campus Life',
      entryFeeMinor: int.tryParse(json['entryFeeMinor'].toString()) ?? 0,
      currency: json['currency'] ?? 'ETB',
      maxAttendees: json['maxAttendees'],
      bannerUrl: json['bannerUrl'],
      organizerName: json['organizer'] != null ? json['organizer']['displayName'] : null,
      rsvpCount: json['_count'] != null ? (json['_count']['rsvps'] ?? 0) : 0,
    );
  }
}

class EventRsvp {
  final String id;
  final String eventId;
  final String ticketCode;
  final String status;
  final String createdAt;
  final CampusEvent? event;

  EventRsvp({
    required this.id,
    required this.eventId,
    required this.ticketCode,
    required this.status,
    required this.createdAt,
    this.event,
  });

  factory EventRsvp.fromJson(Map<String, dynamic> json) {
    return EventRsvp(
      id: json['id'],
      eventId: json['eventId'] ?? '',
      ticketCode: json['ticketCode'] ?? '',
      status: json['status'] ?? 'registered',
      createdAt: json['createdAt'] ?? '',
      event: json['event'] != null ? CampusEvent.fromJson(json['event']) : null,
    );
  }
}
