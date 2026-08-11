'use client';

export type AnalyticsEvent =
  | 'landing_view'
  | 'test_started'
  | 'memory_started'
  | 'memory_completed'
  | 'math_started'
  | 'math_completed'
  | 'maze_started'
  | 'maze_completed'
  | 'remember_reason_started'
  | 'remember_reason_completed'
  | 'test_completed'
  | 'result_viewed'
  | 'result_shared'
  | 'result_downloaded'
  | 'challenge_clicked'
  | 'retry_clicked';

export function useAnalytics() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trackEvent = (event: AnalyticsEvent, properties?: Record<string, any>) => {
    // Log to console in development. Easy to replace with PostHog / Google Analytics later.
    console.log(`[Analytics Event] ${event}`, properties || '');
    
    // Future integration template:
    // if (typeof window !== 'undefined' && (window as any).posthog) {
    //   (window as any).posthog.capture(event, properties);
    // }
  };

  return { trackEvent };
}
