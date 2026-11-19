import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class CampusMapScreen extends StatefulWidget {
  const CampusMapScreen({super.key});

  @override
  State<CampusMapScreen> createState() => _CampusMapScreenState();
}

class _CampusMapScreenState extends State<CampusMapScreen> {
  String _selectedCategory = 'All';

  final List<_Landmark> _landmarks = [
    _Landmark('Haramaya Main Library', 'Academic', 'Central Main Campus', 'Open 24 Hours for Exam Season', Icons.local_library, Colors.blue),
    _Landmark('Haramaya Institute of Technology (HiT)', 'College', 'North Campus Zone B', 'Software, Civil, Electrical & Mechanical', Icons.domain, Colors.indigo),
    _Landmark('Central Student Lounge & Cafe', 'Dining', 'Next to Main Gate', 'Fresh coffee, snacks, & student lounge', Icons.local_cafe, Colors.amber),
    _Landmark('Student Health Clinic & Emergency', 'Health', 'Block 18 Gate 3', '24/7 Outpatient & Pharmacy', Icons.local_hospital, Colors.red),
    _Landmark('Commercial Bank of Ethiopia (CBE ATM)', 'Finance', 'Administration Building Ground Floor', '24/7 ATM & Agent Services', Icons.atm, Colors.green),
    _Landmark('Main Campus Sports Complex', 'Sports', 'South Athletic Grounds', 'Football stadium, basketball & volleyball courts', Icons.sports_soccer, Colors.purple),
  ];

  @override
  Widget build(BuildContext context) {
    final filtered = _selectedCategory == 'All'
        ? _landmarks
        : _landmarks.where((l) => l.category == _selectedCategory).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Haramaya Campus Map & Directory', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: Column(
        children: [
          // Simulated Interactive Map Card
          Container(
            height: 180,
            width: double.infinity,
            margin: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.blue.shade900,
              borderRadius: BorderRadius.circular(16),
              image: const DecorationImage(
                image: NetworkImage('https://maps.googleapis.com/maps/api/staticmap?center=9.421,42.031&zoom=15&size=600x300&sensor=false'),
                fit: BoxFit.cover,
                opacity: 0.4,
              ),
            ),
            child: Stack(
              children: [
                Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.location_on, size: 42, color: Colors.amber),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(color: Colors.black.withOpacity(0.8), borderRadius: BorderRadius.circular(20)),
                        child: const Text('Haramaya University Main Campus (Bate)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Categories horizontal scroll
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: ['All', 'Academic', 'College', 'Dining', 'Health', 'Finance', 'Sports']
                  .map((cat) => Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(cat),
                          selected: _selectedCategory == cat,
                          selectedColor: AppColors.primary,
                          labelStyle: TextStyle(
                            color: _selectedCategory == cat ? Colors.white : AppColors.textPrimary,
                            fontWeight: FontWeight.w600,
                          ),
                          onSelected: (_) => setState(() => _selectedCategory = cat),
                        ),
                      ))
                  .toList(),
            ),
          ),
          const SizedBox(height: 12),

          // Landmarks List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: filtered.length,
              itemBuilder: (context, index) {
                final item = filtered[index];
                return Card(
                  elevation: 0,
                  margin: const EdgeInsets.only(bottom: 10),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: AppColors.border),
                  ),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: item.color.withOpacity(0.1),
                      child: Icon(item.icon, color: item.color, size: 22),
                    ),
                    title: Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    subtitle: Text('${item.zone} · ${item.info}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    trailing: IconButton(
                      icon: const Icon(Icons.directions, color: AppColors.primary),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Directions to ${item.name} starting from current location.')),
                        );
                      },
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _Landmark {
  final String name;
  final String category;
  final String zone;
  final String info;
  final IconData icon;
  final Color color;

  _Landmark(this.name, this.category, this.zone, this.info, this.icon, this.color);
}
