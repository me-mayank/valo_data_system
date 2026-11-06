'use client';

import { useState } from 'react';
import SectionHeader from '@/components/site/SectionHeader';
import CourseCell from '@/components/site/CourseCell';
import Tag from '@/components/ui/Tag';

export default function CoursesCatalog({ initialCourses = [] }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Derive unique categories from live courses
  const categories = [
    'ALL',
    ...Array.from(
      new Set(
        initialCourses
          .map((c) => c.category?.toUpperCase())
          .filter(Boolean)
      )
    ),
  ];

  const filteredCourses = initialCourses.filter((course) => {
    if (selectedCategory === 'ALL') return true;
    return course.category?.toUpperCase() === selectedCategory;
  });

  return (
    <div className="space-y-8">
      {/* Filter Chips Bar (PRD §10.4 Tag component) */}
      <div className="border-[1px] border-navy p-3 bg-cream flex flex-wrap items-center gap-2">
        <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy-soft mr-2">
          FILTER:
        </span>
        {categories.map((cat) => (
          <Tag
            key={cat}
            selected={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Tag>
        ))}
      </div>

      {/* Courses Grid */}
      <section>
        <SectionHeader
          index="01"
          label="Published courses"
          meta={`${filteredCourses.length} COURSE${filteredCourses.length === 1 ? '' : 'S'} FOUND`}
        />

        {filteredCourses.length === 0 ? (
          <div className="border-[1px] border-navy p-12 text-center bg-cream mt-6">
            <p className="font-mono text-sm text-navy-soft">
              No courses found for category: [{selectedCategory}].
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className="mt-4 font-mono text-[12px] uppercase tracking-[0.08em] text-coral font-medium underline"
            >
              Reset filter to ALL →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredCourses.map((course) => (
              <CourseCell
                key={course._id || course.slug}
                code={course.code}
                title={course.title}
                shortDescription={course.shortDescription}
                duration={course.duration}
                mode={course.mode}
                level={course.level}
                tools={course.tools}
                slug={course.slug}
                thumbnail={course.thumbnail}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
