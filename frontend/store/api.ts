import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { JournalEntry, JournalStats, JournalCreatePayload } from '../lib/types';
import { API_BASE_URL } from '../lib/constants';

// Choose base URL depending on runtime (server vs client).
// - Client (browser): use NEXT_PUBLIC_API_URL (points to host port 8201 so browser can reach it).
// - Server (Next SSR inside the frontend container): use the docker-compose service hostname `backend` so the container can reach the backend over the internal network.
const _apiBaseClient = API_BASE_URL.replace(/\/api\/?$/, '').replace(/\/$/, '') + '/api';
const _apiBaseServer = 'http://backend/api';
const _baseUrl = typeof window === 'undefined' ? _apiBaseServer : _apiBaseClient;

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: _baseUrl, credentials: 'include' }),
  tagTypes: ['Journal', 'Stats'],
  endpoints: (build) => ({
    getEntries: build.query<JournalEntry[], Record<string, any> | void>({
      query: (params) => ({ url: '/journal', params: params ?? undefined }),
      providesTags: ['Journal'],
    }),
    getStats: build.query<JournalStats, void>({
      query: () => ({ url: '/journal/stats' }),
      providesTags: ['Stats'],
    }),
    createEntry: build.mutation<JournalEntry, JournalCreatePayload>({
      query: (body) => ({ url: '/journal', method: 'POST', body }),
      invalidatesTags: ['Journal', 'Stats'],
    }),
    deleteEntry: build.mutation<void, number | string>({
      query: (id) => ({ url: `/journal/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Journal', 'Stats'],
    }),
  }),
});

export const {
  useGetEntriesQuery,
  useGetStatsQuery,
  useCreateEntryMutation,
  useDeleteEntryMutation,
} = api;
