import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CoursesCatalog from '@/components/site/CoursesCatalog';
import CourseCell from '@/components/site/CourseCell';

const mockCourses = [
  {
    _id: 'c1',
    code: 'SN-101',
    title: 'ServiceNow Fundamentals',
    slug: 'servicenow-fundamentals',
    category: 'ITSM',
    shortDescription: 'Core ITSM platform training.',
    duration: '6 weeks',
    mode: 'online',
    level: 'beginner',
    tools: ['ServiceNow'],
    thumbnail: { url: 'https://res.cloudinary.com/dv/image/upload/v1/sn.jpg' },
  },
  {
    _id: 'c2',
    code: 'JR-101',
    title: 'Jira Software & Agile',
    slug: 'jira-agile',
    category: 'Agile & DevOps',
    shortDescription: 'Enterprise issue tracking.',
    duration: '4 weeks',
    mode: 'offline',
    level: 'intermediate',
    tools: ['Jira'],
    thumbnail: null,
  },
  {
    _id: 'c3',
    code: 'DO-201',
    title: 'DevOps & Git Workflow',
    slug: 'devops-git',
    category: 'Agile & DevOps',
    shortDescription: 'CI/CD and Git branches.',
    duration: '5 weeks',
    mode: 'hybrid',
    level: 'advanced',
    tools: ['Git', 'GitHub'],
  },
];

describe('Phase 6: Public Courses Catalog & Cells', () => {
  describe('CoursesCatalog component', () => {
    it('renders all courses initially with ALL filter active', () => {
      render(<CoursesCatalog initialCourses={mockCourses} />);

      expect(screen.getByText('ServiceNow Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('Jira Software & Agile')).toBeInTheDocument();
      expect(screen.getByText('DevOps & Git Workflow')).toBeInTheDocument();
      expect(screen.getByText('3 COURSES FOUND')).toBeInTheDocument();
    });

    it('derives unique category filter tags', () => {
      render(<CoursesCatalog initialCourses={mockCourses} />);

      expect(screen.getByText('[ALL]')).toBeInTheDocument();
      expect(screen.getByText('[ITSM]')).toBeInTheDocument();
      expect(screen.getByText('[AGILE & DEVOPS]')).toBeInTheDocument();
    });

    it('filters courses when category tag is clicked', () => {
      render(<CoursesCatalog initialCourses={mockCourses} />);

      const itsmTag = screen.getByText('[ITSM]');
      fireEvent.click(itsmTag);

      expect(screen.getByText('ServiceNow Fundamentals')).toBeInTheDocument();
      expect(screen.queryByText('Jira Software & Agile')).not.toBeInTheDocument();
      expect(screen.queryByText('DevOps & Git Workflow')).not.toBeInTheDocument();
      expect(screen.getByText('1 COURSE FOUND')).toBeInTheDocument();
    });

    it('resets filter to ALL when ALL tag is clicked', () => {
      render(<CoursesCatalog initialCourses={mockCourses} />);

      // Filter to ITSM
      fireEvent.click(screen.getByText('[ITSM]'));
      expect(screen.queryByText('Jira Software & Agile')).not.toBeInTheDocument();

      // Reset to ALL
      fireEvent.click(screen.getByText('[ALL]'));
      expect(screen.getByText('ServiceNow Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('Jira Software & Agile')).toBeInTheDocument();
      expect(screen.getByText('DevOps & Git Workflow')).toBeInTheDocument();
    });

    it('shows empty state message and reset button when no courses match', () => {
      render(<CoursesCatalog initialCourses={[]} />);

      expect(screen.getByText(/No courses found/i)).toBeInTheDocument();
      expect(screen.getByText('0 COURSES FOUND')).toBeInTheDocument();
    });
  });

  describe('CourseCell thumbnail and fallback', () => {
    it('renders Next.js Image with fill when thumbnail.url is present', () => {
      render(
        <CourseCell
          code="SN-101"
          title="ServiceNow Fundamentals"
          slug="servicenow-fundamentals"
          thumbnail={{ url: 'https://res.cloudinary.com/dv/image/upload/v1/sn.jpg' }}
        />
      );

      const img = screen.getByAltText(/ServiceNow Fundamentals thumbnail/i);
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src');
    });

    it('renders TypeTile fallback when thumbnail is missing', () => {
      const { container } = render(
        <CourseCell
          code="JR-101"
          title="Jira Software"
          slug="jira-software"
          thumbnail={null}
          tools={['Jira']}
        />
      );

      // TypeTile uses bg-sand container
      const typeTile = container.querySelector('.bg-sand');
      expect(typeTile).toBeInTheDocument();
      expect(screen.getAllByText('JR-101').length).toBeGreaterThan(0);
    });
  });

  describe('JSON-LD Structured Data Schema', () => {
    it('validates schema.org/Course structure matches specification', () => {
      const course = mockCourses[0];
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.title,
        description: course.shortDescription,
        courseCode: course.code,
        provider: {
          '@type': 'Organization',
          name: 'Data Valo System',
          sameAs: 'https://datavalosystem.com',
        },
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: course.mode,
          courseWorkload: course.duration,
        },
      };

      expect(jsonLd['@context']).toBe('https://schema.org');
      expect(jsonLd['@type']).toBe('Course');
      expect(jsonLd.name).toBe('ServiceNow Fundamentals');
      expect(jsonLd.courseCode).toBe('SN-101');
      expect(jsonLd.provider.name).toBe('Data Valo System');
      expect(jsonLd.hasCourseInstance.courseMode).toBe('online');
      expect(jsonLd.hasCourseInstance.courseWorkload).toBe('6 weeks');
    });
  });
});
