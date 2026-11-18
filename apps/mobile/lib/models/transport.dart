class TransportOperator {
  final String id;
  final String name;
  final String? phone;

  TransportOperator({
    required this.id,
    required this.name,
    this.phone,
  });

  factory TransportOperator.fromJson(Map<String, dynamic> json) {
    return TransportOperator(
      id: json['id'],
      name: json['name'],
      phone: json['phone'],
    );
  }
}

class TransportRoute {
  final String id;
  final String origin;
  final String destination;
  final String departureStation;
  final String arrivalStation;
  final int? estimatedDurationMin;
  final int? distanceKm;

  TransportRoute({
    required this.id,
    required this.origin,
    required this.destination,
    required this.departureStation,
    required this.arrivalStation,
    this.estimatedDurationMin,
    this.distanceKm,
  });

  factory TransportRoute.fromJson(Map<String, dynamic> json) {
    return TransportRoute(
      id: json['id'],
      origin: json['origin'],
      destination: json['destination'],
      departureStation: json['departureStation'],
      arrivalStation: json['arrivalStation'],
      estimatedDurationMin: json['estimatedDurationMin'],
      distanceKm: json['distanceKm'],
    );
  }
}

class Trip {
  final String id;
  final TransportOperator operator;
  final TransportRoute route;
  final String vehicleType;
  final String vehicleNumber;
  final DateTime departureTime;
  final int totalSeats;
  final int availableSeats;
  final String priceMinor;
  final String currency;

  Trip({
    required this.id,
    required this.operator,
    required this.route,
    required this.vehicleType,
    required this.vehicleNumber,
    required this.departureTime,
    required this.totalSeats,
    required this.availableSeats,
    required this.priceMinor,
    required this.currency,
  });

  factory Trip.fromJson(Map<String, dynamic> json) {
    return Trip(
      id: json['id'],
      operator: TransportOperator.fromJson(json['operator']),
      route: TransportRoute.fromJson(json['route']),
      vehicleType: json['vehicleType'] ?? 'Bus',
      vehicleNumber: json['vehicleNumber'] ?? '',
      departureTime: DateTime.parse(json['departureTime']),
      totalSeats: json['totalSeats'] ?? 30,
      availableSeats: json['availableSeats'] ?? 0,
      priceMinor: json['priceMinor'].toString(),
      currency: json['currency'] ?? 'ETB',
    );
  }
}

class TicketReservation {
  final String id;
  final String passengerName;
  final String passengerPhone;
  final int seatNumber;
  final String qrCode;
  final String amountMinor;
  final String status;
  final String paymentStatus;
  final DateTime createdAt;
  final Trip? trip;

  TicketReservation({
    required this.id,
    required this.passengerName,
    required this.passengerPhone,
    required this.seatNumber,
    required this.qrCode,
    required this.amountMinor,
    required this.status,
    required this.paymentStatus,
    required this.createdAt,
    this.trip,
  });

  factory TicketReservation.fromJson(Map<String, dynamic> json) {
    return TicketReservation(
      id: json['id'],
      passengerName: json['passengerName'],
      passengerPhone: json['passengerPhone'],
      seatNumber: json['seatNumber'],
      qrCode: json['qrCode'],
      amountMinor: json['amountMinor'].toString(),
      status: json['status'],
      paymentStatus: json['paymentStatus'],
      createdAt: DateTime.parse(json['createdAt']),
      trip: json['trip'] != null ? Trip.fromJson(json['trip']) : null,
    );
  }
}
