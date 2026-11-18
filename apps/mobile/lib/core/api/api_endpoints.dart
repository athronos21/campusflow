class ApiEndpoints {
  // 10.0.2.2 is the localhost alias for the standard Android Emulator.
  // When testing on a physical phone via Wi-Fi, replace with your PC's local LAN IP (e.g. 192.168.1.X)
  static const String baseUrl = 'http://10.0.2.2:4000/api/v1';

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String me = '/users/me';

  // Campus & Directory
  static const String campuses = '/campuses';
  static const String businesses = '/businesses';
  static const String products = '/products';

  // Orders
  static const String orders = '/orders';
  static const String myOrders = '/orders/my-orders';

  // Bookings
  static const String bookings = '/bookings';
  static const String myBookings = '/bookings/my-bookings';

  // Transport
  static const String transportTrips = '/transport/trips';
  static const String transportReservations = '/transport/reservations';
  static const String transportMyReservations = '/transport/reservations/my';

  // Housing
  static const String housingListings = '/housing/listings';
  static const String housingViewings = '/housing/viewings';
  static const String housingMyViewings = '/housing/viewings/my';

  // Events
  static const String events = '/events';
  static const String myEventRsvps = '/events/rsvps/my';

  // Learning Resources
  static const String learningResources = '/learning/resources';
}
