import { supabase } from '../lib/supabase';
import { getCurrentUserId } from './authService';

export type DriverDocument = {
  id: string;
  docType:
    | 'cnic_front'
    | 'cnic_back'
    | 'license'
    | 'vehicle_registration'
    | 'vehicle_photo'
    | 'profile_photo';
  fileUrl: string;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'expired';
  rejectionReason?: string;
  expiresAt?: string;
  createdAt: string;
};

export const DOCUMENT_TYPES: { id: DriverDocument['docType']; label: string }[] = [
  { id: 'cnic_front', label: 'CNIC (front)' },
  { id: 'cnic_back', label: 'CNIC (back)' },
  { id: 'license', label: "Driver's license" },
  { id: 'vehicle_registration', label: 'Vehicle registration' },
  { id: 'vehicle_photo', label: 'Vehicle photo' },
  { id: 'profile_photo', label: 'Profile photo' },
];

export async function fetchMyDocuments(): Promise<DriverDocument[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('driver_documents')
    .select('*')
    .eq('driver_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    docType: row.doc_type,
    fileUrl: row.file_url,
    verificationStatus: row.verification_status,
    rejectionReason: row.rejection_reason ?? undefined,
    expiresAt: row.expires_at ?? undefined,
    createdAt: row.created_at,
  }));
}

/** Uploads a local file (base64 or URI-derived blob) to the private `driver-docs` bucket and records it. */
export async function uploadDriverDocument(
  docType: DriverDocument['docType'],
  fileUri: string,
  mimeType = 'image/jpeg',
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const response = await fetch(fileUri);
  const blob = await response.blob();
  const ext = mimeType.split('/')[1] ?? 'jpg';
  const path = `${userId}/${docType}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from('driver-docs').upload(path, blob, {
    contentType: mimeType,
    upsert: true,
  });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('driver_documents')
    .insert({ driver_id: userId, doc_type: docType, file_url: path, verification_status: 'pending' })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export type Vehicle = {
  id: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  registrationNumber?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  isAvailable: boolean;
};

export async function fetchMyVehicles(): Promise<Vehicle[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  const { data, error } = await supabase.from('vehicles').select('*').eq('owner_id', userId);
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    make: row.make ?? undefined,
    model: row.model ?? undefined,
    year: row.year ?? undefined,
    color: row.color ?? undefined,
    registrationNumber: row.registration_number ?? undefined,
    verificationStatus: row.verification_status,
    isAvailable: row.is_available,
  }));
}

export async function registerVehicle(vehicle: {
  make: string;
  model: string;
  year: number;
  color: string;
  registrationNumber: string;
  categorySlug?: string;
  serviceModes?: string[];
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  let categoryId: string | undefined;
  if (vehicle.categorySlug) {
    const { data } = await supabase
      .from('vehicle_categories')
      .select('id')
      .eq('slug', vehicle.categorySlug)
      .maybeSingle();
    categoryId = data?.id;
  }

  const { data, error } = await supabase
    .from('vehicles')
    .insert({
      owner_id: userId,
      category_id: categoryId ?? null,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      registration_number: vehicle.registrationNumber,
      service_modes: vehicle.serviceModes ?? ['local'],
      verification_status: 'pending',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
