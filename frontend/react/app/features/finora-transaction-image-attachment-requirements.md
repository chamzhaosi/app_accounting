# Finora Transaction Image Attachment Feature

## Objective

Add image attachment support to Finora transactions.

### Approved Implementation Decisions

This requirement has been reviewed against the current Finora codebase. The
following decisions are part of the implementation scope:

- Target Android only for the first implementation. iOS and web attachment
  support are out of scope.
- Present the Attachment Manager and full-image preview as full-screen modals
  owned by the transaction create/edit screen. Do not add separate Expo Router
  pages for them.
- If attachment changes would be discarded by leaving the transaction screen,
  show a discard confirmation before navigating away.
- Permanently delete attachment database rows and physical files when their
  transaction is deleted.
- Support multiple gallery selection immediately, limited by the remaining
  attachment capacity.
- Add all new user-facing attachment text to the existing English, Simplified
  Chinese, and Malay translations.

### Current Codebase Alignment

The examples in this document are conceptual. Implementation must follow the
current project structure and conventions:

- Transaction and attachment IDs use UUID `TEXT` values, not auto-incrementing
  integer IDs.
- An attachment belongs to the main transaction row only. It must not be linked
  to generated transaction-fee rows.
- Add the attachment schema through the existing SQLite migration system. The
  current schema version is `16`, so this feature uses migration version `17`.
- Extend the existing transaction create, update, and delete repository
  transactions so attachment database changes commit with the related
  transaction changes.
- Transactions are currently soft-deleted as a complete operation. Since a soft
  delete does not activate `ON DELETE CASCADE`, attachment rows and files must be
  cleaned explicitly when the transaction operation is deleted.
- Use the existing Expo Router stack header and `headerRight` behavior for the
  attachment button and badge.
- Use the existing `react-native-paper` modal/portal and Finora component/theme
  patterns for attachment UI.
- Place repository, service, types, constants, hooks, and UI components in the
  existing Finora folders described in Section 35 rather than introducing a new
  top-level transaction architecture.

Users should be able to attach images such as:

- Receipts
- Invoices
- Payment screenshots
- Bank transfer confirmations
- Product photos
- Food photos
- Service/beauty photos
- Any other image related to a transaction

The feature must support all transaction types:

- Income
- Expense
- Transfer

Use the term **Attachment** throughout the codebase rather than `Receipt`, because images may not always be receipts.

---

## 1. Transaction Header

Add an attachment icon to the top-right side of the transaction page header.

Example:

```text
< Back          Add Expense          📎
```

When one or more images have been added, show a badge counter on the attachment icon.

Examples:

```text
📎      0 attachments
📎¹     1 attachment
📎²     2 attachments
📎⁵     5 attachments
```

Use a `paperclip` or similar attachment icon instead of a camera icon because users can attach images from both the camera and gallery.

The attachment icon should be available for:

```text
Income
Expense
Transfer
```

The transaction form itself must **not display the selected image previews**.

Only the attachment count badge should be visible on the main transaction form.

---

## 2. Attachment Limit

Allow a maximum of:

```ts
const MAX_TRANSACTION_ATTACHMENTS = 5;
```

per transaction.

When the maximum number is reached:

- Prevent the user from adding more images.
- Disable or hide the Add action.
- Display an appropriate message if needed:

```text
You can attach up to 5 images.
```

Keep this value in centralized configuration instead of hardcoding `5` across multiple components.

Recommended configuration:

```ts
export const TRANSACTION_ATTACHMENT_CONFIG = {
  maxAttachments: 5,
  maxDimension: 1800,
  compressionQuality: 0.75,
  directory: "attachments",
} as const;
```

---

## 3. Opening the Attachment Icon

### Case A — No attachment exists

When the user taps the attachment icon and there are currently no images, immediately display an action menu / bottom sheet:

```text
Add Attachment

📷 Take Photo
🖼 Choose from Gallery

Cancel
```

Do not open an empty attachment manager first.

### Case B — Attachment already exists

When one or more images exist, tapping the attachment icon should open the Attachment Manager.

Example:

```text
< Back             Attachments              + Add


┌────────────┐  ┌────────────┐
│          × │  │          × │
│            │  │            │
│   Image    │  │   Image    │
│            │  │            │
└────────────┘  └────────────┘


2 of 5 attachments
```

---

## 4. Attachment Manager

The Attachment Manager must allow users to:

- View all current attachments.
- Add another attachment.
- Take a photo.
- Choose image(s) from the device gallery.
- Tap an image to open a larger/full-screen preview.
- Remove an attachment.
- See the current attachment count.
- Know when the maximum attachment count has been reached.

Recommended thumbnail dimensions:

```text
110–120 px width
110–120 px height
```

All thumbnails should use a consistent size regardless of the original image dimensions.

Example:

```text
┌──────────────┐
│            × │
│              │
│    Image     │
│              │
│              │
└──────────────┘
```

---

## 5. Remove Button

Every attachment thumbnail must contain an `×` button at the top-right corner.

Requirements:

- Button should be slightly inset from the image edge.
- Use a circular or semi-transparent background.
- Provide a reasonable touch area.
- Pressing the `×` button must only remove that specific image.

Recommended touch target:

```text
approximately 32 × 32 px or larger
```

For newly selected, unsaved images, no confirmation dialog is required.

For existing attachments during Edit mode, deletion should be staged until the transaction is successfully saved.

---

## 6. Full Image Preview

When the user taps a thumbnail, open a larger image preview.

Example:

```text
< Back                       Attachment


┌──────────────────────────────────┐
│                                  │
│                                  │
│              Image               │
│                                  │
│                                  │
└──────────────────────────────────┘
```

Requirements:

- Preserve image aspect ratio.
- Do not crop receipt/document images.
- Use `contain` behavior rather than `cover`.
- Allow the user to return to the attachment manager.

The preview may also expose a Remove/Delete action if appropriate.

---

## 7. Add Attachment Options

Users must have two image sources.

### Camera

```text
Take Photo
```

Use Expo Image Picker to launch the native camera.

### Gallery

```text
Choose from Gallery
```

Use Expo Image Picker to open the device photo library.

Gallery selection must support multiple image selection on Android while
respecting the remaining attachment capacity.

Example:

```text
Current attachments: 2
Maximum attachments: 5

User can select at most another 3 images.
```

Configure the picker selection limit from the remaining capacity and also
validate or truncate the returned result defensively so the total can never
exceed `TRANSACTION_ATTACHMENT_CONFIG.maxAttachments`. If a specific Android
device cannot provide multiple selection, handle the limitation gracefully
without allowing the attachment limit to be exceeded.

---

## 8. Required Libraries

Use Expo libraries where possible.

The current app uses Expo SDK `56`. At the time this requirement was reviewed,
`expo-image-picker`, `expo-image-manipulator`, and `expo-image` were not direct
dependencies. `expo-file-system` was present only transitively and must be added
as a direct dependency. Install SDK-compatible versions with `npx expo install`.

### Camera and gallery

Use:

```text
expo-image-picker
```

Responsibilities:

- Take photo.
- Choose image from gallery.
- Camera permission.
- Photo library permission.

Installation:

```bash
npx expo install expo-image-picker
```

Do not add `expo-camera` unless a custom camera screen is required later.

### Image optimization

Use:

```text
expo-image-manipulator
```

Responsibilities:

- Resize images.
- Compress images.
- Convert output format.

Installation:

```bash
npx expo install expo-image-manipulator
```

Use the current non-deprecated API supported by the Expo SDK version installed in the project.

### Local file storage

Use:

```text
expo-file-system
```

Responsibilities:

- Create the attachment directory.
- Copy/move optimized image files.
- Delete image files.
- Get file metadata where needed.
- Resolve persistent paths.

Installation:

```bash
npx expo install expo-file-system
```

### Image rendering

Prefer:

```text
expo-image
```

Responsibilities:

- Display thumbnails.
- Display full image preview.
- Better image caching/rendering.

Installation:

```bash
npx expo install expo-image
```

If the current application already has a suitable image component, it can be reused, but `expo-image` is preferred.

### Existing libraries

Continue using:

```text
expo-sqlite
react-native-paper
```

for:

- attachment database records
- header icon
- badge
- modal/action UI where appropriate

Do not introduce unnecessary alternatives such as:

```text
react-native-image-picker
react-native-fs
react-native-compressor
expo-camera
```

unless required by a future feature.

---

## 9. Image Optimization

Do not store full-resolution camera images directly.

Every newly selected image must be optimized before being permanently stored by Finora.

Processing flow:

```text
Camera / Gallery
       ↓
Original temporary image
       ↓
Validate
       ↓
Resize if required
       ↓
Compress
       ↓
Generate optimized JPEG
       ↓
Copy into Finora private storage
```

Recommended default configuration:

```ts
MAX_IMAGE_DIMENSION = 1800;
IMAGE_COMPRESSION_QUALITY = 0.75;
OUTPUT_FORMAT = JPEG;
```

---

## 10. Resize Logic

Resize based on the image's longest dimension.

Do not simply force every image to `width: 1800`.

Landscape example:

```text
4000 × 3000
↓
1800 × 1350
```

Portrait example:

```text
1200 × 3500
↓
617 × 1800
```

If the source image is already smaller than the configured maximum:

```text
1000 × 1200
```

do not upscale it.

Maintain the original aspect ratio.

---

## 11. Compression

Compress the optimized image to approximately:

```text
JPEG quality = 0.75
```

The goal is to significantly reduce storage usage while keeping receipt text and normal photos readable.

Do not store the original camera image inside Finora unless it already exists separately in the user's photo gallery.

Finora only needs to keep its optimized copy.

---

## 12. Image Format

For the first implementation, store optimized images as:

```text
JPEG
```

Use a predictable extension such as:

```text
.jpg
```

Do not store images as Base64 inside SQLite.

Avoid:

```text
data:image/jpeg;base64,...
```

SQLite should only store metadata and relative file paths.

---

## 13. Attachment Directory

Create a Finora-only attachment directory inside persistent app storage.

Conceptually:

```text
<App Document Directory>/
└── attachments/
    ├── 21dbab3c-....jpg
    ├── c8342b7f-....jpg
    ├── e51aabc4-....jpg
    └── ...
```

Use UUIDs for filenames.

Example:

```text
attachments/7388d70c-6c17-41fb-a938-6bddca24827d.jpg
```

Do not depend on the transaction ID as the filename because the transaction may not exist yet while the user is creating it.

---

## 14. Database Path

Do not persist the complete OS-specific absolute URI.

Do not save:

```text
file:///data/user/0/.../attachments/7388d70c.jpg
```

Save only:

```text
attachments/7388d70c-6c17-41fb-a938-6bddca24827d.jpg
```

The application should resolve the relative path against Finora's current document directory when loading an image.

This is important for future:

- Backup.
- Restore.
- Device migration.
- Export.

---

## 15. Database Table

Because a transaction can contain multiple attachments, create a separate attachment table.

Schema aligned with the current Finora database conventions:

```sql
CREATE TABLE transaction_attachments (
    id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT,
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (transaction_id)
        REFERENCES transactions(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_transaction_attachments_transaction
    ON transaction_attachments(transaction_id, created_at);
```

Create this table in the normal schema setup and in database migration version
`17`. Attachment IDs and transaction IDs are UUID strings. `transaction_id`
must reference the main transaction row, never a fee row.

Attachment rows do not need Finora sync or soft-delete columns in this version:
image synchronization is out of scope, and removal permanently deletes both the
row and its physical file.

Suggested metadata:

```text
id
transaction_id
file_path
file_name
mime_type
file_size
width
height
created_at
```

---

## 16. New Transaction Attachment State

While creating a transaction, there is no transaction ID yet.

Maintain the attachments in local/form state.

Recommended model:

```ts
type TransactionAttachment = {
  id: string;
  localPath: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
  width?: number;
  height?: number;
};
```

Example:

```ts
const [pendingAttachments, setPendingAttachments] = useState<
  TransactionAttachment[]
>([]);
```

The `id` should be a locally generated UUID.

---

## 17. New Transaction Add Image Flow

When the user chooses an image:

```text
Select image
    ↓
Optimize image
    ↓
Generate UUID filename
    ↓
Copy optimized file to /attachments
    ↓
Add entry to pendingAttachments
    ↓
Update attachment badge
```

The file may be stored immediately even though the transaction itself has not yet been saved.

This makes previewing and management easier.

---

## 18. Saving a New Transaction

When the user presses Save:

```text
Create transaction
       ↓
Obtain transaction ID
       ↓
Insert attachment records using transaction ID
       ↓
Complete transaction save
```

The operation should avoid leaving incomplete database records.

Where practical, transaction creation and attachment DB inserts should participate in the same SQLite transaction.

---

## 19. Cancel New Transaction

If a user:

```text
adds attachments
↓
does not save the transaction
↓
leaves/discards the page
```

Finora must delete all newly created attachment files associated only with that unsaved transaction.

When pending attachments exist and the user attempts to leave using the stack
Back button or Android system back gesture/button, show a translated discard
confirmation. Continue navigating only after cleanup succeeds. If cleanup
cannot fully complete, report the failure and keep the user on the screen so the
files are not silently orphaned.

Otherwise orphan files would accumulate inside app storage.

Example:

```text
pendingAttachments = [A, B, C]

User discards transaction

Delete A
Delete B
Delete C
Clear pendingAttachments
```

---

## 20. Editing Existing Transactions

When an existing transaction is opened:

- Load its attachments from the database.
- Show the current attachment count in the header.
- Existing images remain unless the user explicitly removes them.
- New images can be added.
- Existing images can be marked for removal.

Recommended state:

```ts
existingAttachments;
newAttachments;
removedAttachmentIds;
```

Example:

```text
Existing:
A
B

User removes B
User adds C
```

State:

```ts
existingAttachments = [A, B];
newAttachments = [C];
removedAttachmentIds = [B.id];
```

---

## 21. Saving an Edited Transaction

When Save succeeds:

```text
A → keep

B → delete DB record
     delete physical file

C → insert DB record
     keep physical file
```

Only permanently delete an existing attachment after the edited transaction is successfully committed.

Because SQLite and the filesystem cannot share one atomic transaction, use a
recoverable file-deletion strategy for committed attachments. Move files marked
for deletion into a private temporary/trash location when Save begins, commit
the attachment row changes with the transaction update, restore the moved files
if the database transaction fails, and permanently delete the staged files only
after the database commit succeeds. Clean stale trash files safely during a
later attachment-service initialization if final deletion was interrupted.

---

## 22. Cancel Editing

If the user edits a transaction and then cancels:

```text
Existing attachment A → keep
Existing attachment B marked removed → keep
New attachment C → delete
```

The original transaction must remain unchanged.

If new attachments were added or existing attachments were staged for removal,
intercept stack and Android system back navigation with a translated discard
confirmation. On confirmation, delete only the newly added files, clear staged
removals, and leave every previously committed attachment unchanged.

Never permanently delete an existing image just because the user pressed `×` while editing.

---

## 23. Delete Transaction

Deleting a transaction must also remove all physical image files belonging to it.

Required flow:

```text
Get transaction attachments
       ↓
Delete attachment files
       ↓
Delete attachment DB records
       ↓
Delete transaction
```

`ON DELETE CASCADE` can remove attachment rows from SQLite, but it cannot delete physical files.

Finora soft-deletes transaction rows rather than physically deleting them, so
`ON DELETE CASCADE` will not run in the normal transaction-delete flow. The
transaction repository/service must therefore explicitly permanently delete the
attachment rows associated with the main transaction and remove their files.

Therefore application code must handle file deletion.

Ensure failure handling does not leave the transaction DB and file system in an inconsistent state.

Use the same recoverable trash/staging strategy described in Section 21 for
transaction deletion. If staging a file fails, do not delete the transaction.
If the SQLite transaction fails, restore staged files. After the SQLite
transaction successfully soft-deletes the transaction operation and hard-deletes
its attachment rows, permanently remove the staged files. A final trash cleanup
failure may be retried later and must not restore an attachment to a deleted
transaction.

---

## 24. Removing a Newly Added Attachment

When the user removes an attachment that has not yet been committed:

```text
tap ×
↓
remove from state
↓
delete optimized file
↓
update badge
```

No confirmation dialog is necessary.

---

## 25. Attachment Processing State

Prevent users from repeatedly triggering attachment actions while an image is being processed.

Use something similar to:

```ts
const [isProcessingAttachment, setIsProcessingAttachment] = useState(false);
```

While processing:

- Disable Add.
- Disable Take Photo.
- Disable Choose from Gallery.
- Prevent duplicate operations.
- Show loading feedback if processing takes noticeable time.

Example:

```text
Processing image...
```

---

## 26. Permission Handling

Handle camera and gallery permission gracefully.

Camera permission denied:

```text
Camera permission is required to take a photo.
```

Photo access denied:

```text
Photo permission is required to choose an image.
```

Do not crash.

Provide meaningful Expo permission descriptions.

Example app configuration:

```json
[
  "expo-image-picker",
  {
    "photosPermission": "Allow Finora to access your photos so you can attach images to transactions.",
    "cameraPermission": "Allow Finora to use your camera so you can attach photos to transactions.",
    "microphonePermission": false
  }
]
```

Microphone access is not required.

This feature targets Android. Add the `expo-image-picker` config plugin and its
permission descriptions to the existing `app.json` plugin list. Do not add iOS-
or web-specific attachment behavior as part of this implementation. Request
runtime permission only where required by the Android/Expo API and handle all
denied or unavailable states with translated messages.

---

## 27. Picker Cancellation

If the user opens the camera/gallery and cancels:

```text
do nothing
```

The existing attachment state must remain unchanged.

---

## 28. Processing Failure

If image resizing/compression fails:

- Do not add the attachment.
- Do not create a DB record.
- Clean temporary files if necessary.
- Show a message such as:

```text
Unable to process the image.
```

---

## 29. File Save Failure

If copying the optimized image into Finora's storage fails:

- Do not add the attachment to state.
- Do not create a DB record.
- Clean temporary files where possible.
- Show an appropriate error.

---

## 30. Missing Physical File

If the database contains an attachment but its actual image file is missing:

- Do not crash.
- Show an unavailable-image placeholder.
- Allow the broken attachment record to be removed.

---

## 31. File Size Metadata

After optimizing an image, store the optimized file size in:

```text
file_size
```

Do not store the original image size as the attachment size.

This will support a future storage management feature.

Example future query:

```sql
SELECT SUM(file_size)
FROM transaction_attachments;
```

---

## 32. Future Storage Page Compatibility

No storage management UI is required now.

However, this implementation should allow Finora to eventually provide:

```text
Attachment Storage

Used: 182 MB

[ Manage Attachments ]
```

Therefore attachment metadata must be reliable.

---

## 33. Future Attachment Gallery Compatibility

No global attachment gallery is required as part of this task.

However, the design should support a future screen such as:

```text
Attachments

September 2026

3 Sep
[ image ] [ image ] [ image ]

2 Sep
[ image ] [ image ]
```

The future gallery should be able to query attachments through their linked transactions.

Do not create a duplicate gallery database.

---

## 34. Future Backup Compatibility

Backup/restore implementation is out of scope.

However, relative attachment paths must be used so a future Finora backup can contain:

```text
finora-backup/
├── database.db
└── attachments/
    ├── a.jpg
    ├── b.jpg
    └── c.jpg
```

Restoring the backup should not depend on the original Android/iOS absolute app path.

---

## 35. Component Architecture

Do not place all attachment logic inside the transaction form component.

Prefer reusable components/services.

Suggested structure:

```text
transaction/
├── components/
│   ├── TransactionAttachmentButton.tsx
│   ├── TransactionAttachmentManager.tsx
│   └── TransactionAttachmentPreview.tsx
│
├── services/
│   └── transactionAttachmentService.ts
│
├── repositories/
│   └── transactionAttachmentRepository.ts
│
├── types/
│   └── transactionAttachment.ts
│
└── constants/
    └── transactionAttachmentConfig.ts
```

Adjust according to the existing Finora project structure rather than creating unnecessary architectural layers.

For the current codebase, use these integration locations:

```text
app/transaction_management/_components/
  TransactionAttachmentButton.tsx
  TransactionAttachmentManager.tsx
  TransactionAttachmentPreview.tsx

hook/transaction_management/
  useTransactionAttachments.ts

sql/repo/
  transactionAttachmentRepo.ts

sql/service/
  transactionAttachmentService.ts

sql/types/
  transactionAttachmentType.ts

constants/
  transactionAttachments.ts
```

The create and detail controller hooks may compose the reusable attachment hook,
but image processing and file operations must not be implemented directly in
`create.tsx`, `[id].tsx`, or the shared transaction form.

The manager and preview are full-screen `react-native-paper` modals/portals, not
new files in the Expo Router route tree. Keeping them owned by the transaction
screen preserves pending create/edit state while users move between the manager
and preview.

---

## 36. Attachment Service Responsibilities

Image-related filesystem logic should be separated from UI.

Suggested responsibilities:

```ts
takePhoto();
pickImages();
optimizeImage();
saveOptimizedImage();
deleteAttachmentFile();
resolveAttachmentUri();
getAttachmentFileInfo();
```

The transaction UI should not directly implement image compression or filesystem manipulation.

---

## 37. Repository Responsibilities

The attachment repository should handle SQLite operations such as:

```ts
getByTransactionId(transactionId)
insertAttachment(...)
insertAttachments(...)
deleteAttachment(id)
deleteByTransactionId(transactionId)
```

Follow the existing Finora repository/data-access pattern.

---

## 38. UI Badge

Use the existing React Native Paper components where appropriate.

Conceptually:

```tsx
<View>
  <IconButton icon="paperclip" onPress={handleAttachmentPress} />

  {attachmentCount > 0 && <Badge>{attachmentCount}</Badge>}
</View>
```

Badge must immediately update when the user:

- adds an image
- removes an image
- edits existing attachments

---

## 39. Attachment Icon Behavior Summary

No attachments:

```text
📎
```

Tap:

```text
Take Photo
Choose from Gallery
```

After adding two:

```text
📎²
```

Tap:

```text
Attachment Manager
```

---

## 40. Full Expected Create Flow

```text
< Back          Add Expense           📎
                                       ↓
                                user taps icon
                                       ↓
                         Take Photo / Choose Gallery
                                       ↓
                                select image
                                       ↓
                              validate image
                                       ↓
                        resize longest edge ≤ 1800
                                       ↓
                          JPEG compress at 0.75
                                       ↓
                              generate UUID
                                       ↓
                    save to Finora /attachments folder
                                       ↓
                          add to pending state
                                       ↓
                             badge becomes 📎¹
                                       ↓
                              tap 📎¹
                                       ↓
                           Attachment Manager

                           ┌────────────┐
                           │          × │
                           │   image    │
                           │            │
                           └────────────┘

                              1 of 5
                                       ↓
                           tap image → preview
                           tap × → remove
                           + Add → add another
                                       ↓
                           Save Transaction
                                       ↓
                         insert transaction
                                       ↓
                       obtain transaction ID
                                       ↓
                    insert attachment DB records
                                       ↓
                               complete
```

---

## 41. Acceptance Criteria

The feature is complete when all of the following are true:

- Income supports attachments.
- Expense supports attachments.
- Transfer supports attachments.
- Attachment icon appears in the transaction header.
- Badge displays attachment count.
- Main transaction form does not render attachment thumbnails.
- User can take photos.
- User can select photos from the gallery.
- Android gallery selection supports selecting multiple images up to the
  remaining attachment capacity.
- Camera/gallery cancellation does not modify state.
- Camera/gallery permission denial is handled gracefully.
- Maximum of 5 images is enforced.
- Images are resized before storage when necessary.
- Images maintain their aspect ratio.
- Images are not upscaled.
- Images are JPEG compressed at the configured quality.
- Original full-size picker images are not duplicated into Finora storage.
- Optimized images are stored in Finora's persistent attachment directory.
- UUIDs are used for attachment filenames.
- SQLite stores relative paths rather than absolute device URIs.
- SQLite does not store image Base64 data.
- Multiple attachments are represented using a separate attachment table.
- Attachment Manager displays thumbnails.
- Each thumbnail has an `×` remove button.
- Tapping a thumbnail opens a full image preview.
- Receipts are previewed without cropping.
- Removing a new attachment deletes its generated file.
- Cancelling a new transaction deletes its pending attachment files.
- Leaving a create/edit screen with attachment changes requires discard
  confirmation and handles the Android system back action.
- Editing a transaction does not immediately delete existing files.
- Cancelling Edit restores the original attachment state.
- Saving Edit correctly commits additions/removals.
- Deleting a transaction deletes its physical attachment files.
- Processing errors do not create invalid attachment DB records.
- Missing files do not crash the application.
- File size metadata is recorded.
- Attachment UI and messages are available in English, Simplified Chinese, and
  Malay.
- The first implementation works on Android; iOS and web are not required.
- Attachment logic is separated from the main transaction form where practical.
- The design remains compatible with future attachment gallery, storage management, backup and restore features.

---

## Out of Scope for This Task

Do **not** implement these features yet:

```text
OCR / receipt text recognition
AI receipt scanning
Automatic amount/date/category extraction
PDF attachments
Video attachments
Cloud image storage
Image synchronization
iOS attachment support
Web attachment support
Backup/restore
Global attachment gallery
Storage management page
Image editing/cropping UI
Custom camera UI
```

The current implementation should only establish a solid transaction-image attachment foundation that these features can build on later.
