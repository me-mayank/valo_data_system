'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { clientApi, ClientApiError } from '@/lib/api/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import Toast from '@/components/ui/Toast';

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CourseForm({ course = null }) {
  const router = useRouter();
  const isEditing = Boolean(course?._id);

  // Form State
  const [title, setTitle] = useState(course?.title || '');
  const [slug, setSlug] = useState(course?.slug || '');
  const [isSlugCustom, setIsSlugCustom] = useState(Boolean(course?.slug));
  const [code, setCode] = useState(course?.code || '');
  const [shortDescription, setShortDescription] = useState(course?.shortDescription || '');
  const [overview, setOverview] = useState(course?.overview || '');
  const [category, setCategory] = useState(course?.category || '');
  const [tools, setTools] = useState(course?.tools || []);
  const [toolInput, setToolInput] = useState('');
  const [level, setLevel] = useState(course?.level || 'beginner');
  const [mode, setMode] = useState(course?.mode || 'online');
  const [duration, setDuration] = useState(course?.duration || '');
  const [audience, setAudience] = useState(course?.audience || '');
  const [fee, setFee] = useState(course?.fee ?? '');
  const [status, setStatus] = useState(course?.status || 'draft');
  const [featured, setFeatured] = useState(Boolean(course?.featured));
  const [sortOrder, setSortOrder] = useState(course?.sortOrder ?? 0);
  const [thumbnail, setThumbnail] = useState(course?.thumbnail || null);

  // Syllabus State: [{ title: string, topics: string[] }]
  const [syllabus, setSyllabus] = useState(
    course?.syllabus?.length
      ? course.syllabus.map((m) => ({ title: m.title || '', topics: m.topics || [] }))
      : [{ title: 'Module 1: Introduction', topics: ['Overview', 'Fundamentals'] }]
  );

  // Status & Upload State
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, setToast] = useState(null);

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!isSlugCustom) {
      setSlug(slugify(val));
    }
  };

  const handleAddTool = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = toolInput.trim().replace(/^,+|,+$/g, '');
      if (trimmed && !tools.includes(trimmed)) {
        setTools([...tools, trimmed]);
        setToolInput('');
      }
    }
  };

  const handleRemoveTool = (toolToRemove) => {
    setTools(tools.filter((t) => t !== toolToRemove));
  };

  // Syllabus module helpers
  const handleAddModule = () => {
    setSyllabus([
      ...syllabus,
      { title: `Module ${syllabus.length + 1}: `, topics: [''] },
    ]);
  };

  const handleRemoveModule = (index) => {
    setSyllabus(syllabus.filter((_, idx) => idx !== index));
  };

  const handleModuleTitleChange = (index, val) => {
    const updated = [...syllabus];
    updated[index].title = val;
    setSyllabus(updated);
  };

  const handleAddTopic = (moduleIndex) => {
    const updated = [...syllabus];
    updated[moduleIndex].topics.push('');
    setSyllabus(updated);
  };

  const handleTopicChange = (moduleIndex, topicIndex, val) => {
    const updated = [...syllabus];
    updated[moduleIndex].topics[topicIndex] = val;
    setSyllabus(updated);
  };

  const handleRemoveTopic = (moduleIndex, topicIndex) => {
    const updated = [...syllabus];
    updated[moduleIndex].topics = updated[moduleIndex].topics.filter(
      (_, idx) => idx !== topicIndex
    );
    setSyllabus(updated);
  };

  // Direct Cloudinary Upload handler
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 2 MB limit.');
      return;
    }

    setUploadingImage(true);
    setErrorMessage('');

    try {
      // 1. Get signed parameters from backend
      const signData = await clientApi.post('/api/admin/uploads/sign');

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signData.apiKey);
      formData.append('timestamp', signData.timestamp);
      formData.append('signature', signData.signature);
      formData.append('folder', signData.folder);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`;
      const cloudRes = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!cloudRes.ok) {
        throw new Error('Cloudinary upload failed.');
      }

      const cloudJson = await cloudRes.json();
      setThumbnail({
        url: cloudJson.secure_url,
        publicId: cloudJson.public_id,
      });
      setToast({ message: 'OK: Image uploaded to Cloudinary.', type: 'ok' });
    } catch (err) {
      if (err instanceof ClientApiError && err.status === 501) {
        setErrorMessage(
          'Image upload service is not configured (Cloudinary keys missing in server environment).'
        );
      } else {
        setErrorMessage(err.message || 'Image upload failed.');
      }
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      code: code.trim() || undefined,
      shortDescription: shortDescription.trim(),
      overview: overview.trim() || undefined,
      category: category.trim() || undefined,
      tools,
      level,
      mode,
      duration: duration.trim() || undefined,
      audience: audience.trim() || undefined,
      fee: fee === '' ? undefined : Number(fee),
      status,
      featured,
      sortOrder: Number(sortOrder) || 0,
      thumbnail: thumbnail || undefined,
      syllabus: syllabus
        .filter((m) => m.title.trim())
        .map((m) => ({
          title: m.title.trim(),
          topics: m.topics.map((t) => t.trim()).filter(Boolean),
        })),
    };

    try {
      if (isEditing) {
        await clientApi.put(`/api/admin/courses/${course._id}`, payload);
      } else {
        await clientApi.post('/api/admin/courses', payload);
      }
      router.push('/admin/courses');
      router.refresh();
    } catch (err) {
      setLoading(false);
      if (err instanceof ClientApiError && err.status === 409) {
        setErrorMessage(`A course with slug '${slug}' already exists. Choose a unique slug.`);
      } else {
        setErrorMessage(err.message || 'Failed to save course.');
      }
    }
  };

  return (
    <div className="max-w-4xl border border-navy bg-cream p-6 md:p-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Header Bar */}
      <div className="border-b border-navy pb-4 mb-6 flex items-center justify-between">
        <div>
          <span className="font-mono text-xs text-navy-soft uppercase">
            [COURSE SPECIFICATION {isEditing ? `ID: ${course._id}` : 'NEW'}]
          </span>
          <h2 className="font-mono text-xl font-bold uppercase text-navy">
            {isEditing ? `Edit: ${course.title}` : 'Create New Course Specification'}
          </h2>
        </div>
        <Link
          href="/admin/courses"
          className="border border-navy px-3 py-1 font-mono text-xs text-navy hover:bg-sand transition-colors"
        >
          ← CANCEL & RETURN
        </Link>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 border border-error bg-cream p-3 text-xs font-mono text-error flex items-start gap-2"
        >
          <span className="font-bold">[ERROR]</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Code and Title */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <Input
              id="course-code"
              label="Code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="SN-101"
              maxLength={12}
              className="font-mono uppercase text-sm"
            />
          </div>

          <div className="md:col-span-3">
            <Input
              id="course-title"
              label="Course Title"
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. ServiceNow Fundamentals"
              className="font-sans text-sm font-bold"
            />
          </div>
        </div>

        {/* Row 2: Slug and Short Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="course-slug" className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy">
                URL SLUG <span className="text-navy-soft font-mono text-[12px]">REQUIRED</span>
              </label>
              <label className="flex items-center gap-1.5 font-mono text-[11px] text-navy-soft cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSlugCustom}
                  onChange={(e) => setIsSlugCustom(e.target.checked)}
                  className="h-3 w-3 accent-coral"
                />
                Manual Edit
              </label>
            </div>
            <input
              id="course-slug"
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={!isSlugCustom}
              className="mt-1 bg-white text-navy font-mono text-xs border border-navy min-h-[44px] px-3 py-2 w-full outline-none disabled:bg-sand/30"
            />
            <p className="font-mono text-[10px] text-navy-soft mt-1">
              Public URL: /courses/{slug || '...'}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="course-desc" className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy">
                SHORT DESCRIPTION <span className="text-navy-soft font-mono text-[12px]">REQUIRED</span>
              </label>
              <span
                className={`font-mono text-[11px] ${
                  shortDescription.length > 160 ? 'text-error font-bold' : 'text-navy-soft'
                }`}
              >
                {shortDescription.length}/160
              </span>
            </div>
            <input
              id="course-desc"
              type="text"
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Master the platform used by 85% of Fortune 500 companies."
              maxLength={160}
              className="mt-1 bg-white text-navy font-sans text-xs border border-navy min-h-[44px] px-3 py-2 w-full outline-none"
            />
          </div>
        </div>

        {/* Row 3: Overview */}
        <div>
          <Textarea
            id="course-overview"
            label="Overview / Long Description"
            rows={3}
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            placeholder="Detailed course scope, practical exercises, and lab environment info..."
            className="font-sans text-xs"
          />
        </div>

        {/* Row 4: Category, Level, Mode, Duration */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-b border-rule-soft py-4">
          <Input
            id="course-category"
            label="Category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. ITSM"
            className="font-mono text-xs"
          />

          <Select
            id="course-level"
            label="Level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="font-mono text-xs"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </Select>

          <Select
            id="course-mode"
            label="Mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="font-mono text-xs"
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="hybrid">Hybrid</option>
          </Select>

          <Input
            id="course-duration"
            label="Duration"
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 6 weeks"
            className="font-mono text-xs"
          />
        </div>

        {/* Row 5: Audience, Fee, Tools */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            id="course-audience"
            label="Target Audience"
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g. 2nd to 4th year students"
            className="font-sans text-xs"
          />

          <Input
            id="course-fee"
            label="Fee (INR ₹)"
            type="number"
            min={0}
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            placeholder="Hidden if left empty"
            className="font-mono text-xs"
          />

          <div>
            <label htmlFor="course-tools" className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy">
              TOOLS TAUGHT (ENTER / COMMA)
            </label>
            <input
              id="course-tools"
              type="text"
              value={toolInput}
              onChange={(e) => setToolInput(e.target.value)}
              onKeyDown={handleAddTool}
              placeholder="e.g. ServiceNow, Jira"
              className="mt-1 bg-white text-navy font-mono text-xs border border-navy min-h-[44px] px-3 py-2 w-full outline-none"
            />
            {tools.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tools.map((tool) => (
                  <span
                    key={tool}
                    onClick={() => handleRemoveTool(tool)}
                    className="inline-flex items-center gap-1 bg-sand border border-navy px-1.5 py-0.5 font-mono text-[10px] text-navy cursor-pointer hover:bg-error hover:text-white transition-colors"
                    title="Click to remove"
                  >
                    {tool} ✕
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 6: Syllabus Builder */}
        <div className="border border-navy bg-sand/10 p-4">
          <div className="flex items-center justify-between mb-3 border-b border-rule-soft pb-2">
            <div>
              <span className="font-mono text-xs font-bold text-navy uppercase">
                Syllabus Architecture
              </span>
              <p className="font-sans text-[11px] text-navy-soft">
                Define curriculum modules and specific learning outcomes.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddModule}
              className="text-xs font-mono py-1"
            >
              + ADD MODULE
            </Button>
          </div>

          <div className="space-y-4">
            {syllabus.map((moduleItem, mIdx) => (
              <div
                key={mIdx}
                className="border border-rule-soft bg-cream p-3 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-navy">
                    [{mIdx + 1}]
                  </span>
                  <input
                    type="text"
                    value={moduleItem.title}
                    onChange={(e) => handleModuleTitleChange(mIdx, e.target.value)}
                    placeholder="Module Title..."
                    className="bg-white border border-navy px-2 py-1 font-mono text-xs flex-1 font-bold outline-none"
                  />
                  {syllabus.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveModule(mIdx)}
                      className="text-error hover:text-error/80 text-xs font-mono px-2"
                    >
                      [REMOVE MODULE]
                    </button>
                  )}
                </div>

                {/* Topics List */}
                <div className="pl-6 space-y-1.5">
                  {moduleItem.topics.map((topic, tIdx) => (
                    <div key={tIdx} className="flex items-center gap-2">
                      <span className="text-[10px] text-navy-soft font-mono">
                        •
                      </span>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) =>
                          handleTopicChange(mIdx, tIdx, e.target.value)
                        }
                        placeholder="Topic description..."
                        className="bg-white border border-rule-soft px-2 py-1 font-sans text-xs flex-1 outline-none"
                      />
                      {moduleItem.topics.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(mIdx, tIdx)}
                          className="text-navy-soft hover:text-error text-[11px] font-mono px-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddTopic(mIdx)}
                    className="text-[11px] font-mono text-navy hover:text-coral font-bold mt-1"
                  >
                    + Add Topic
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 7: Thumbnail Upload */}
        <div className="border border-navy bg-cream p-4">
          <label className="block font-mono text-xs font-bold text-navy uppercase mb-1">
            Course Thumbnail (Optional — Cloudinary Signed Upload)
          </label>
          <p className="font-sans text-[11px] text-navy-soft mb-3">
            JPG, PNG, or WebP up to 2 MB. If empty, public catalog renders a typographic spec tile.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            {thumbnail?.url ? (
              <div className="border border-navy p-1 bg-white relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnail.url}
                  alt="Thumbnail Preview"
                  className="w-36 h-24 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setThumbnail(null)}
                  className="mt-1 w-full bg-sand hover:bg-error hover:text-white text-navy font-mono text-[10px] py-0.5 uppercase transition-colors"
                >
                  [REMOVE]
                </button>
              </div>
            ) : (
              <div className="w-36 h-24 border border-dashed border-rule-soft bg-sand/20 flex flex-col items-center justify-center text-center p-2">
                <span className="font-mono text-[10px] text-navy-soft uppercase">
                  TYPOGRAPHIC TILE ACTIVE
                </span>
              </div>
            )}

            <div className="flex-1">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageFileChange}
                disabled={uploadingImage}
                className="font-mono text-xs text-navy file:mr-4 file:py-1 file:px-3 file:border file:border-navy file:text-xs file:font-mono file:bg-sand file:text-navy hover:file:bg-coral hover:file:text-navy"
              />
              {uploadingImage && (
                <p className="font-mono text-xs text-coral font-bold mt-2">
                  UPLOADING TO CLOUDINARY...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Row 8: Status, Featured, Sort Order */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-rule-soft pt-4 items-center">
          <Select
            id="course-status"
            label="Publish Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="font-mono text-xs font-bold"
          >
            <option value="draft">DRAFT (Internal)</option>
            <option value="published">PUBLISHED (Public)</option>
          </Select>

          <Checkbox
            id="course-featured"
            label="Featured on Homepage (Top 3)"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />

          <Input
            id="course-sort-order"
            label="Sort Order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="font-mono text-xs"
          />
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-navy flex items-center justify-end gap-4">
          <Link href="/admin/courses">
            <Button variant="secondary" type="button" disabled={loading} className="text-xs">
              CANCEL
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || uploadingImage}
            className="font-mono text-xs font-bold uppercase py-2 px-6"
          >
            {loading ? 'SAVING COURSE...' : isEditing ? 'UPDATE SPECIFICATION →' : 'PUBLISH / SAVE COURSE →'}
          </Button>
        </div>
      </form>
    </div>
  );
}
