import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../models/learning.dart';
import '../../services/learning_service.dart';

class LearningScreen extends StatefulWidget {
  const LearningScreen({super.key});

  @override
  State<LearningScreen> createState() => _LearningScreenState();
}

class _LearningScreenState extends State<LearningScreen> {
  final LearningService _learningService = LearningService();
  List<LearningResource> _resources = [];
  bool _isLoading = true;
  String _selectedDept = 'All';

  @override
  void initState() {
    super.initState();
    _loadResources();
  }

  Future<void> _loadResources() async {
    setState(() => _isLoading = true);
    try {
      final results = await _learningService.getResources(department: _selectedDept);
      if (!mounted) return;
      setState(() => _resources = results);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load study resources: $e')),
      );
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _handleDownload(LearningResource item) async {
    try {
      await _learningService.recordDownload(item.id);
      if (!mounted) return;
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.cloud_download, color: AppColors.primary),
              SizedBox(width: 8),
              Text('Material Download', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(item.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 6),
              Text('Course: ${item.courseCode} • ${item.department}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  item.fileUrl,
                  style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: Colors.blue),
                ),
              ),
              const SizedBox(height: 8),
              const Text('Download recorded! Document opening...', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('OK', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      );
      _loadResources();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Download failed: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Academic Study Bank', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0.5,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : Column(
              children: [
                // Department filter chips
                Container(
                  color: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildFilterPill('All', 'All Departments'),
                        const SizedBox(width: 8),
                        _buildFilterPill('Computer Science', 'Comp Sci'),
                        const SizedBox(width: 8),
                        _buildFilterPill('Agricultural Economics', 'Agro-Econ'),
                        const SizedBox(width: 8),
                        _buildFilterPill('Engineering', 'Engineering'),
                      ],
                    ),
                  ),
                ),

                Expanded(
                  child: _resources.isEmpty
                      ? const Center(child: Text('No study materials found.'))
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _resources.length,
                          itemBuilder: (context, index) {
                            final res = _resources[index];
                            return Card(
                              elevation: 0,
                              margin: const EdgeInsets.only(bottom: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                                side: const BorderSide(color: AppColors.border),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: Colors.blue.shade50,
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            res.courseCode,
                                            style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.blue.shade900,
                                            ),
                                          ),
                                        ),
                                        Row(
                                          children: [
                                            const Icon(Icons.download, size: 13, color: AppColors.textSecondary),
                                            const SizedBox(width: 3),
                                            Text(
                                              '${res.downloadCount} downloads',
                                              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      res.title,
                                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        const Icon(Icons.account_balance, size: 14, color: AppColors.textSecondary),
                                        const SizedBox(width: 4),
                                        Text(
                                          '${res.department} • By ${res.uploaderName ?? 'Senior Student'}',
                                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                        ),
                                      ],
                                    ),
                                    if (res.description != null) ...[
                                      const SizedBox(height: 6),
                                      Text(
                                        res.description!,
                                        style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                    const Divider(height: 20),

                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          res.resourceType.replaceAll('_', ' ').toUpperCase(),
                                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted),
                                        ),
                                        ElevatedButton.icon(
                                          onPressed: () => _handleDownload(res),
                                          icon: const Icon(Icons.download, size: 16, color: Colors.white),
                                          label: const Text('Download', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: const Color(0xFF0F172A),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
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

  Widget _buildFilterPill(String dept, String label) {
    final isSelected = _selectedDept == dept;
    return GestureDetector(
      onTap: () {
        setState(() => _selectedDept = dept);
        _loadResources();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: isSelected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
