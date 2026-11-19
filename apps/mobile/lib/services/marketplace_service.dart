import '../models/marketplace_item.dart';

class MarketplaceService {
  static Future<List<MarketplaceItem>> getItems() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return [
      MarketplaceItem(
        id: 'm-1',
        title: 'Casio fx-991EX Scientific Calculator',
        category: 'Electronics',
        price: 850.0,
        condition: 'Like New',
        sellerName: 'Abebe Tadesse (Software Engineering)',
        sellerDorm: 'Block 42, Room 204',
        phone: '+251911223344',
        description: 'Original solar powered Casio calculator. Used for one semester calculus exam. Works perfectly.',
        createdAt: DateTime.now().subtract(const Duration(hours: 3)),
      ),
      MarketplaceItem(
        id: 'm-2',
        title: 'Introduction to Algorithms (CLRS 3rd Edition)',
        category: 'Textbooks',
        price: 500.0,
        condition: 'Good',
        sellerName: 'Bethlehem Girma (Computer Science)',
        sellerDorm: 'Block 12, Room 108',
        phone: '+251922334455',
        description: 'Clean textbook with no pencil marks. Essential for Data Structures & Algorithms course.',
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
      MarketplaceItem(
        id: 'm-3',
        title: 'Dorm Study Desk Lamp & Extension Cable',
        category: 'Dorm Supplies',
        price: 400.0,
        condition: 'Used',
        sellerName: 'Yared Solomon (Civil Eng)',
        sellerDorm: 'Block 35, Room 301',
        phone: '+251933445566',
        description: 'Warm LED study light with 3m extension cord. Very useful for late night exam prep.',
        createdAt: DateTime.now().subtract(const Duration(days: 2)),
      ),
    ];
  }
}
