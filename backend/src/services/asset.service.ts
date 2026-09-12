import { v2 as cloudinary } from 'cloudinary';
import { query } from '../utils/db';

// Call this endpoint when an asset is uploaded via frontend directly
export const addAssetData = async (publicId: string, resourceType: string) => {
  try {
    const result = await query(
      `INSERT INTO media_assets (public_id, resource_type, ref_count)
      VALUES ($1, $2, 0)
      ON CONFLICT (public_id) DO NOTHING
      RETURNING public_id`,
      [publicId, resourceType]
    );

    if (result.rows.length === 0) return null;
    return result.rows[0].public_id;

  } catch (error) {
    console.error("Error inserting new asset data:", error);
    throw error;
  }
};

// Update asset reference counters during board modification
export const updateAssetRefs = async (oldPublicIds: string[], newPublicIds: string[]) => {
  const added = newPublicIds.filter((id) => !oldPublicIds.includes(id));
  const removed = oldPublicIds.filter((id) => !newPublicIds.includes(id));

  try {
    if (added.length > 0) { // increment added assets
      await query(
        `UPDATE media_assets 
        SET ref_count = ref_count + 1, updated_at = NOW() 
        WHERE public_id = ANY($1::text[])`,
        [added]
      );
    }

    if (removed.length > 0) { // decrement removed assets
      await query(
        `UPDATE media_assets 
        SET ref_count = ref_count - 1, updated_at = NOW() 
        WHERE public_id = ANY($1::text[])`,
        [removed]
      );
    }
  } catch (error) {
    console.error("Error updating asset references:", error);
    throw error;
  }
};