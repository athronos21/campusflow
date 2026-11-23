import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssistantQueryDto } from './dto/assistant-query.dto';

@Injectable()
export class AssistantService {
  constructor(private readonly prisma: PrismaService) {}

  async processQuery(dto: AssistantQueryDto) {
    const q = dto.query.toLowerCase().trim();
    const campusId = dto.campusId;

    // 1. Shuttle / Transit queries
    if (q.includes('shuttle') || q.includes('bus') || q.includes('transport') || q.includes('trip') || q.includes('ride')) {
      const trips = await this.prisma.trip.findMany({
        where: {
          status: 'scheduled',
          departureTime: { gte: new Date() },
          ...(campusId ? { campusId } : {}),
        },
        include: {
          route: {
            select: { origin: true, destination: true },
          },
        },
        take: 3,
        orderBy: { departureTime: 'asc' },
      });

      if (trips.length > 0) {
        const tripDetails = trips.map((t) => {
          const time = new Date(t.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const fare = (Number(t.priceMinor) / 100).toFixed(2);
          const origin = t.route?.origin || 'Main Terminal';
          const destination = t.route?.destination || 'Campus Route';
          return `• ${origin} → ${destination} at ${time} (${fare} ETB, ${t.availableSeats} seats open)`;
        }).join('\n');

        return {
          answer: `🚌 Upcoming campus shuttles:\n${tripDetails}\n\nYou can reserve your seat directly under the Transport tab!`,
          sources: ['Campus Transport Database'],
        };
      }

      return {
        answer: '🚌 HU Express Shuttles operate every 15 minutes between Main Campus Lounge, Technology Institute (HiT), and Health Sciences. Next departure is scheduled from Main Gate terminal.',
        sources: ['Campus Transport Dispatch'],
      };
    }

    // 2. Dining / Cafeteria / Food queries
    if (q.includes('cafe') || q.includes('food') || q.includes('dining') || q.includes('meal') || q.includes('buna') || q.includes('coffee') || q.includes('lunch') || q.includes('breakfast')) {
      const mealPlans = await this.prisma.mealPlan.findMany({
        where: { isActive: true, ...(campusId ? { campusId } : {}) },
        take: 2,
      });

      const cafeProducts = await this.prisma.product.findMany({
        where: { isAvailable: true, category: { slug: 'food-dining' } },
        take: 3,
      });

      let answer = '🍽️ Dining & Meal Services:\n';
      if (mealPlans.length > 0) {
        answer += `• Subsidized Student Dining: ${mealPlans.map((m) => m.name).join(', ')}.\n`;
      }
      if (cafeProducts.length > 0) {
        answer += `• Popular at Campus Cafe: ${cafeProducts.map((p) => `${p.name} (${(Number(p.priceMinor) / 100).toFixed(2)} ETB)`).join(', ')}.\n`;
      }
      answer += '\nDining passes can be verified at any hall scanner using your Digital Student ID.';

      return {
        answer,
        sources: ['Cafeteria Subsystem', 'Campus Cafe Catalog'],
      };
    }

    // 3. Announcements / News / Events
    if (q.includes('exam') || q.includes('schedule') || q.includes('announcement') || q.includes('news') || q.includes('notice') || q.includes('event')) {
      const announcements = await this.prisma.announcement.findMany({
        where: campusId ? { campusId } : {},
        orderBy: { createdAt: 'desc' },
        take: 2,
      });

      const events = await this.prisma.campusEvent.findMany({
        where: { startsAt: { gte: new Date() }, ...(campusId ? { campusId } : {}) },
        orderBy: { startsAt: 'asc' },
        take: 2,
      });

      let answer = '📢 Recent Campus Bulletins & Events:\n';
      if (announcements.length > 0) {
        answer += announcements.map((a) => `• [Announcement] ${a.title}: ${a.body.slice(0, 100)}...`).join('\n') + '\n';
      }
      if (events.length > 0) {
        answer += events.map((e) => `• [Event] ${e.title} at ${e.venue} (${new Date(e.startsAt).toLocaleDateString()})`).join('\n') + '\n';
      }

      return {
        answer,
        sources: ['Haramaya University Registrar', 'Campus Events Desk'],
      };
    }

    // 4. Library & Academic questions
    if (q.includes('library') || q.includes('book') || q.includes('study') || q.includes('gpa') || q.includes('grade')) {
      return {
        answer: '📚 Haramaya Main Library is open 24/7 during exam season! Regular hours: Monday–Saturday 7:00 AM to 11:00 PM. Postgraduate Library is located behind Block 12. You can project your semester GPA using the Learning tab!',
        sources: ['University Library Board'],
      };
    }

    // 5. Emergency & Health
    if (q.includes('emergency') || q.includes('doctor') || q.includes('clinic') || q.includes('security') || q.includes('police') || q.includes('fire')) {
      return {
        answer: '🚨 For campus emergencies, tap the Emergency SOS button or call Campus Security (+251 25 553 0331) or Student Clinic (+251 25 553 0100). The clinic is located next to Block 8 and operates 24/7.',
        sources: ['Haramaya Emergency Dispatch'],
      };
    }

    // 6. General fallback
    return {
      answer: '🤖 I am your CampusFlow AI Assistant for Haramaya University. You can ask me live questions about shuttle bus departure times, cafeteria menus & meal passes, exam timetables, announcements, or campus emergency contacts!',
      sources: ['CampusFlow Core Knowledge Base'],
    };
  }
}
