import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../models/course_grade.dart';

class AcademicScreen extends StatefulWidget {
  const AcademicScreen({super.key});

  @override
  State<AcademicScreen> createState() => _AcademicScreenState();
}

class _AcademicScreenState extends State<AcademicScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<CourseGrade> _courses = [
    CourseGrade(courseCode: 'CoSc 3012', courseName: 'Data Structures & Algorithms', creditHours: 4, grade: 'A'),
    CourseGrade(courseCode: 'SwEng 3041', courseName: 'Software Engineering Fundamentals', creditHours: 3, grade: 'A-'),
    CourseGrade(courseCode: 'Math 2021', courseName: 'Discrete Mathematics', creditHours: 3, grade: 'B+'),
    CourseGrade(courseCode: 'CoSc 3022', courseName: 'Database Systems', creditHours: 4, grade: 'A'),
    CourseGrade(courseCode: 'EnLa 2011', courseName: 'Technical Report Writing', creditHours: 2, grade: 'A'),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  double get _calculatedGPA {
    double totalPoints = 0;
    int totalCredits = 0;
    for (var c in _courses) {
      totalPoints += c.gradePoint * c.creditHours;
      totalCredits += c.creditHours;
    }
    return totalCredits == 0 ? 0.0 : totalPoints / totalCredits;
  }

  int get _totalCredits {
    return _courses.fold(0, (sum, item) => sum + item.creditHours);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Academic & Timetable', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0.5,
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          tabs: const [
            Tab(text: 'Class Timetable'),
            Tab(text: 'GPA Calculator'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildTimetableTab(),
          _buildGpaCalculatorTab(),
        ],
      ),
    );
  }

  Widget _buildTimetableTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildDaySection(
          day: 'Monday',
          classes: [
            _ClassSchedule('8:30 AM - 10:30 AM', 'Data Structures & Algorithms', 'Hall 04, HiT Block', 'Dr. Mohammed A.'),
            _ClassSchedule('10:45 AM - 12:30 PM', 'Database Systems (Lab)', 'Computer Lab 02', 'Lecturer Sara T.'),
          ],
        ),
        const SizedBox(height: 16),
        _buildDaySection(
          day: 'Tuesday',
          classes: [
            _ClassSchedule('2:00 PM - 4:00 PM', 'Software Engineering Fundamentals', 'Lecture Hall B', 'Prof. Kebede M.'),
          ],
        ),
        const SizedBox(height: 16),
        _buildDaySection(
          day: 'Wednesday',
          classes: [
            _ClassSchedule('8:30 AM - 10:30 AM', 'Discrete Mathematics', 'Hall 01, Main Block', 'Dr. Alamu G.'),
            _ClassSchedule('10:45 AM - 12:30 PM', 'Technical Report Writing', 'Hall 08', 'Instructor Helen B.'),
          ],
        ),
      ],
    );
  }

  Widget _buildDaySection({required String day, required List<_ClassSchedule> classes}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(day, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.primary)),
        const SizedBox(height: 8),
        ...classes.map((item) => Card(
              elevation: 0,
              margin: const EdgeInsets.only(bottom: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: const BorderSide(color: AppColors.border),
              ),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: AppColors.primary.withOpacity(0.1),
                  child: const Icon(Icons.schedule, color: AppColors.primary, size: 20),
                ),
                title: Text(item.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                subtitle: Text('${item.time} · ${item.venue}\n${item.instructor}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                isThreeLine: true,
              ),
            )),
      ],
    );
  }

  Widget _buildGpaCalculatorTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Result Box
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Estimated Semester GPA', style: TextStyle(color: Colors.white70, fontSize: 13)),
                  const SizedBox(height: 4),
                  Text(
                    _calculatedGPA.toStringAsFixed(2),
                    style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text('Total Credit Hours: $_totalCredits', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                ],
              ),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: const BoxDecoration(color: Colors.white24, shape: BoxShape.circle),
                child: const Icon(Icons.calculate, color: Colors.white, size: 36),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        const Text('Course Grade Projection', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary)),
        const SizedBox(height: 10),

        ..._courses.map((course) => Card(
              elevation: 0,
              margin: const EdgeInsets.only(bottom: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: const BorderSide(color: AppColors.border),
              ),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('${course.courseCode}: ${course.courseName}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          const SizedBox(height: 2),
                          Text('${course.creditHours} Credit Hours', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                        ],
                      ),
                    ),
                    DropdownButton<String>(
                      value: course.grade,
                      items: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']
                          .map((g) => DropdownMenuItem(value: g, child: Text(g, style: const TextStyle(fontWeight: FontWeight.bold))))
                          .toList(),
                      onChanged: (val) {
                        if (val != null) {
                          setState(() => course.grade = val);
                        }
                      },
                    ),
                  ],
                ),
              ),
            )),
      ],
    );
  }
}

class _ClassSchedule {
  final String time;
  final String title;
  final String venue;
  final String instructor;

  _ClassSchedule(this.time, this.title, this.venue, this.instructor);
}
