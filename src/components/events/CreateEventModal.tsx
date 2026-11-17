import { CheckCircle2, ChevronDown, ImagePlus, Loader2, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';

import { createEvent } from '../../services/eventsService';
import type { EventCategory } from '../../types/event';
import {
  EMPTY_EVENT_FORM,
  toCreateEventInput,
  validateEventForm,
  type EventFormValues,
} from '../../utils/eventForm';

const CATEGORIES: EventCategory[] = [
  'Music',
  'Sports',
  'Fashion',
  'Technology',
  'Food & Culinary',
];

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const FIELD_CLASSES =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 transition-colors focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/40';

const INVALID_FIELD_CLASSES =
  'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-300/40';

const fieldClass = (invalid?: string): string =>
  `${FIELD_CLASSES} ${invalid ? INVALID_FIELD_CLASSES : ''}`;

interface CreateEventModalProps {
  /** Closes the modal (close icon, Cancel, Escape key or backdrop click). */
  onClose: () => void;
  /** Reports the created event's title for page-level success feedback. */
  onSuccess: (eventTitle: string) => void;
}

/** Inline validation message, linked to its field via `aria-describedby`. */
function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="mt-1.5 text-xs text-red-600">
      {message}
    </p>
  );
}

/**
 * Modal form for creating an event: client-side validation, a simulated
 * async submit through the service layer, and an inline success state.
 *
 * Follows the same dialog conventions as `MobileNavigation` (Escape and
 * backdrop close, `aria-modal`) with added focus trapping and focus restore.
 */
export function CreateEventModal({ onClose, onSuccess }: CreateEventModalProps) {
  const [values, setValues] = useState<EventFormValues>(EMPTY_EVENT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successTitle, setSuccessTitle] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const doneButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  /* Focus the dialog on open, lock background scroll, restore focus on close. */
  useEffect(() => {
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, []);

  /* Escape closes; Tab is trapped inside the dialog. */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.getClientRects().length > 0);

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || active === dialog)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  /* Move focus to the success panel's Done button once the event is saved. */
  useEffect(() => {
    if (successTitle) {
      doneButtonRef.current?.focus();
    }
  }, [successTitle]);

  /* Revoke the cover preview's object URL when the modal unmounts. */
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  function setValue<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) {
        return current;
      }
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (file) {
      previewUrlRef.current = URL.createObjectURL(file);
      setImagePreview(previewUrlRef.current);
    } else {
      setImagePreview(null);
    }
    setImageFile(file);
  }

  function handleRemoveImage() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setImagePreview(null);
    setImageFile(null);
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateEventForm(values);
    setErrors(validationErrors);

    const errorKeys = Object.keys(validationErrors) as (keyof EventFormValues)[];
    if (errorKeys.length > 0) {
      /* Move focus to the first invalid field after the errors render. */
      requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLElement>(`[name="${errorKeys[0]}"]`)?.focus();
      });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const input = toCreateEventInput(values);
      const created = await createEvent({
        ...input,
        image: imagePreview ?? input.image,
      });
      setSuccessTitle(created.title);
      onSuccess(created.title);
    } catch {
      setSubmitError('Something went wrong while creating the event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div aria-hidden="true" className="fixed inset-0 bg-slate-900/50" onClick={onClose} />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-event-title"
        aria-describedby="create-event-description"
        tabIndex={-1}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl focus:outline-none sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id="create-event-title" className="text-lg font-semibold text-slate-900">
              {successTitle ? 'Event Created' : 'Create New Event'}
            </h2>
            <p id="create-event-description" className="mt-0.5 text-sm text-slate-500">
              {successTitle
                ? 'Your event has been saved successfully.'
                : 'Fill in the details below to set up your next event.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        {successTitle ? (
          <div
            role="status"
            className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center sm:px-6"
          >
            <CheckCircle2
              size={56}
              aria-hidden="true"
              className="mx-auto text-emerald-500"
            />
            <h3 className="mt-4 text-base font-semibold text-slate-900">
              Event created successfully!
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              “{successTitle}” has been added to your events.
            </p>
            <button
              ref={doneButtonRef}
              type="button"
              onClick={onClose}
              className="mt-6 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:ring-offset-2"
            >
              Done
            </button>
          </div>
        ) : (
          <form
            ref={formRef}
            noValidate
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto px-5 py-5 sm:grid-cols-2 sm:px-6">
              <div className="sm:col-span-2">
                <label
                  htmlFor="event-name"
                  className="block text-sm font-medium text-slate-700"
                >
                  Event Name <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <input
                  id="event-name"
                  name="name"
                  type="text"
                  required
                  value={values.name}
                  onChange={(event) => setValue('name', event.target.value)}
                  placeholder="e.g. Kampala Jazz Night"
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? 'event-name-error' : undefined}
                  className={`mt-1.5 ${fieldClass(errors.name)}`}
                />
                <FieldError id="event-name-error" message={errors.name} />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="event-description"
                  className="block text-sm font-medium text-slate-700"
                >
                  Event Description <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <textarea
                  id="event-description"
                  name="description"
                  required
                  rows={3}
                  value={values.description}
                  onChange={(event) => setValue('description', event.target.value)}
                  placeholder="Tell attendees what this event is about…"
                  aria-invalid={errors.description ? true : undefined}
                  aria-describedby={errors.description ? 'event-description-error' : undefined}
                  className={`mt-1.5 resize-y ${fieldClass(errors.description)}`}
                />
                <FieldError id="event-description-error" message={errors.description} />
              </div>

              <div>
                <label
                  htmlFor="event-category"
                  className="block text-sm font-medium text-slate-700"
                >
                  Event Category <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <select
                    id="event-category"
                    name="category"
                    required
                    value={values.category}
                    onChange={(event) =>
                      setValue('category', event.target.value as EventFormValues['category'])
                    }
                    aria-invalid={errors.category ? true : undefined}
                    aria-describedby={errors.category ? 'event-category-error' : undefined}
                    className={`appearance-none pr-9 ${fieldClass(errors.category)}`}
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
                <FieldError id="event-category-error" message={errors.category} />
              </div>

              <fieldset className="m-0 border-0 p-0">
                <legend className="p-0 text-sm font-medium text-slate-700">
                  Event Type
                </legend>
                <div className="mt-1.5 flex items-center gap-6 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="eventType"
                      value="Physical"
                      checked={values.eventType === 'Physical'}
                      onChange={() => setValue('eventType', 'Physical')}
                      className="h-4 w-4 accent-orange-500"
                    />
                    Physical
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="eventType"
                      value="Online"
                      checked={values.eventType === 'Online'}
                      onChange={() => setValue('eventType', 'Online')}
                      className="h-4 w-4 accent-orange-500"
                    />
                    Online
                  </label>
                </div>
              </fieldset>

              <div>
                <label
                  htmlFor="event-start"
                  className="block text-sm font-medium text-slate-700"
                >
                  Start Date and Time <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <input
                  id="event-start"
                  name="start"
                  type="datetime-local"
                  required
                  value={values.start}
                  onChange={(event) => setValue('start', event.target.value)}
                  aria-invalid={errors.start ? true : undefined}
                  aria-describedby={errors.start ? 'event-start-error' : undefined}
                  className={`mt-1.5 ${fieldClass(errors.start)}`}
                />
                <FieldError id="event-start-error" message={errors.start} />
              </div>

              <div>
                <label
                  htmlFor="event-end"
                  className="block text-sm font-medium text-slate-700"
                >
                  End Date and Time <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <input
                  id="event-end"
                  name="end"
                  type="datetime-local"
                  required
                  value={values.end}
                  onChange={(event) => setValue('end', event.target.value)}
                  aria-invalid={errors.end ? true : undefined}
                  aria-describedby={errors.end ? 'event-end-error' : undefined}
                  className={`mt-1.5 ${fieldClass(errors.end)}`}
                />
                <FieldError id="event-end-error" message={errors.end} />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="event-location"
                  className="block text-sm font-medium text-slate-700"
                >
                  Event Location <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <input
                  id="event-location"
                  name="location"
                  type="text"
                  required
                  value={values.location}
                  onChange={(event) => setValue('location', event.target.value)}
                  placeholder={
                    values.eventType === 'Online'
                      ? 'e.g. Zoom meeting link'
                      : 'e.g. Kampala Serena Conference Centre, Kampala'
                  }
                  aria-invalid={errors.location ? true : undefined}
                  aria-describedby={errors.location ? 'event-location-error' : undefined}
                  className={`mt-1.5 ${fieldClass(errors.location)}`}
                />
                <FieldError id="event-location-error" message={errors.location} />
              </div>

              <div className="sm:col-span-2">
                <span className="block text-sm font-medium text-slate-700">
                  Event Cover Image{' '}
                  <span className="font-normal text-slate-400">(optional)</span>
                </span>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
                  <input
                    ref={coverInputRef}
                    id="event-cover"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor="event-cover"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 transition-colors hover:text-slate-900 peer-focus-visible:ring-2 peer-focus-visible:ring-orange-500/40"
                  >
                    <ImagePlus size={16} aria-hidden="true" />
                    {imageFile ? 'Replace image' : 'Choose image'}
                  </label>

                  {imagePreview && imageFile ? (
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <img
                        src={imagePreview}
                        alt="Cover preview"
                        className="h-11 w-11 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-slate-700">{imageFile.name}</p>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-xs font-medium text-red-600 transition-colors hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="min-w-0 flex-1 text-xs text-slate-400">
                      PNG or JPG, shown on your event cards.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {submitError && (
              <p
                role="alert"
                className="mx-5 mb-1 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 sm:mx-6"
              >
                {submitError}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} aria-hidden="true" className="animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Plus size={16} aria-hidden="true" />
                    Create Event
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
