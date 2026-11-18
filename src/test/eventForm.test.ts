import { describe, expect, it } from 'vitest';

import type { CreateEventInput } from '../types/event';
import {
  DEFAULT_EVENT_COVER,
  EMPTY_EVENT_FORM,
  buildEventItem,
  toCreateEventInput,
  validateEventForm,
  type EventFormValues,
} from '../utils/eventForm';

/** A fully valid form; individual tests override specific fields. */
const validForm: EventFormValues = {
  name: '  Kampala Jazz Night  ',
  description: '  An evening of jazz by the lake.  ',
  category: 'Music',
  start: '2099-03-10T18:00',
  end: '2099-03-10T21:00',
  location: '  Ndere Cultural Centre, Kampala  ',
  eventType: 'Physical',
};

describe('validateEventForm', () => {
  it('returns no errors for a fully valid form', () => {
    expect(validateEventForm(validForm)).toEqual({});
  });

  it('flags every required field when the form is empty', () => {
    const errors = validateEventForm(EMPTY_EVENT_FORM);

    expect(Object.keys(errors).sort()).toEqual([
      'category',
      'description',
      'end',
      'location',
      'name',
      'start',
    ]);
  });

  it('treats whitespace-only text as missing', () => {
    const errors = validateEventForm({
      ...validForm,
      name: '   ',
      description: '\t\n',
      location: '  ',
    });

    expect(errors.name).toBe('Event name is required.');
    expect(errors.description).toBe('Event description is required.');
    expect(errors.location).toBe('Event location is required.');
  });

  it('requires a category to be selected', () => {
    expect(validateEventForm({ ...validForm, category: '' }).category).toBe(
      'Please select an event category.',
    );
  });

  it('requires both start and end date-times', () => {
    expect(validateEventForm({ ...validForm, start: '' }).start).toBe(
      'Start date and time is required.',
    );
    expect(validateEventForm({ ...validForm, end: '' }).end).toBe(
      'End date and time is required.',
    );
  });

  it('rejects an end date-time that is not after the start', () => {
    expect(
      validateEventForm({ ...validForm, end: validForm.start }).end,
    ).toBe('End date and time must be after the start date and time.');
    expect(
      validateEventForm({ ...validForm, start: '2099-03-10T21:00', end: '2099-03-10T18:00' })
        .end,
    ).toBeDefined();
  });

  it('does not report an order error when the start date is missing', () => {
    const errors = validateEventForm({ ...validForm, start: '' });

    expect(errors.start).toBe('Start date and time is required.');
    expect(errors.end).toBeUndefined();
  });
});

describe('toCreateEventInput', () => {
  it('trims text and converts local date-times to ISO 8601', () => {
    const input = toCreateEventInput(validForm);

    expect(input.title).toBe('Kampala Jazz Night');
    expect(input.description).toBe('An evening of jazz by the lake.');
    expect(input.location).toBe('Ndere Cultural Centre, Kampala');
    expect(input.start).toBe(new Date('2099-03-10T18:00').toISOString());
    expect(input.end).toBe(new Date('2099-03-10T21:00').toISOString());
    expect(input.category).toBe('Music');
    expect(input.eventType).toBe('Physical');
    expect(input.image).toBe(DEFAULT_EVENT_COVER);
  });
});

describe('buildEventItem', () => {
  const input: CreateEventInput = toCreateEventInput(validForm);

  it('maps the payload onto the existing EventItem model', () => {
    const event = buildEventItem(input);

    expect(event).toMatchObject({
      title: 'Kampala Jazz Night',
      category: 'Music',
      date: input.start,
      endDate: input.end,
      venue: 'Ndere Cultural Centre, Kampala',
      status: 'upcoming',
      eventType: 'Physical',
      ticketCapacity: 0,
      ticketsSold: 0,
      description: 'An evening of jazz by the lake.',
    });
    expect(event.id.startsWith('evt-')).toBe(true);
    expect(event.image).toBe(DEFAULT_EVENT_COVER);
  });

  it('derives the lifecycle status from the event dates', () => {
    const past = toCreateEventInput({
      ...validForm,
      start: '1999-01-01T10:00',
      end: '1999-01-01T12:00',
    });
    expect(buildEventItem(past).status).toBe('completed');
  });

  it('prefers an uploaded cover over the default one', () => {
    expect(buildEventItem(input, 'blob:https://localhost/cover').image).toBe(
      'blob:https://localhost/cover',
    );
  });
});
