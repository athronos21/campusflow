import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class StudyGroupsScreen extends StatelessWidget {
  const StudyGroupsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final List<_StudyGroup> groups = [
      _StudyGroup('Data Structures & Algorithms Group', 'CoSc 3012', 'Main Library 2nd Floor (Quiet Zone)', 'Mon & Wed, 4:00 PM', '5 Members', 'Software Eng'),
      _StudyGroup('Software Engineering Exam Prep', 'SwEng 3041', 'HiT Study Pod 03', 'Tue & Thu, 5:30 PM', '4 Members', 'Computer Science'),
      _StudyGroup('Discrete Mathematics Problem Solving', 'Math 2021', 'Student Lounge Study Room', 'Saturdays, 10:00 AM', '6 Members', 'HiT / Electrical'),
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Study Groups & Peer Tutors', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Active Study Groups', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary)),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Form a Study Group: Select course code, venue, and meeting time.')),
                  );
                },
                icon: const Icon(Icons.group_add, color: Colors.white, size: 16),
                label: const Text('Create Group', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            ],
          ),
          const SizedBox(height: 12),

          ...groups.map((g) => Card(
                elevation: 0,
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: AppColors.border)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(6)),
                            child: Text(g.courseCode, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primary)),
                          ),
                          const Spacer(),
                          Text(g.members, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.green)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(g.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.textPrimary)),
                      const SizedBox(height: 4),
                      Text('${g.venue} · ${g.schedule}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          const Icon(Icons.school, size: 14, color: AppColors.textMuted),
                          const SizedBox(width: 4),
                          Text(g.department, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                          const Spacer(),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                            ),
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Joined study group for ${g.courseCode}!')),
                              );
                            },
                            child: const Text('Join Group', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              )),
        ],
      ),
    );
  }
}

class _StudyGroup {
  final String name;
  final String courseCode;
  final String venue;
  final String schedule;
  final String members;
  final String department;

  _StudyGroup(this.name, this.courseCode, this.venue, this.schedule, this.members, this.department);
}
