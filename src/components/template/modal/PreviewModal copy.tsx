// 'use client';

// import { useEffect } from 'react';
// import { SKIN_BEAUTY_CATEGORIES } from '@/app/contents/skinBeautyCategories';
// import { PLASTIC_SURGERY_CATEGORIES } from '@/app/contents/plasticSurgeryCategories';
// import deviceList from '@/constants/device_list.json';
// import { CategoryNodeTag } from '@/models/admin/category';
// import { Device } from '@/models/admin/devices.dto';

// interface PreviewModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   selectedSkinTreatments: Set<string>;
//   selectedPlasticTreatments: Set<string>;
//   selectedDevices: Set<string>;
// }

// const PreviewModal = ({
//   isOpen,
//   onClose,
//   selectedSkinTreatments,
//   selectedPlasticTreatments,
//   selectedDevices,
// }: PreviewModalProps) => {
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }

//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [isOpen]);

//   const parseUid = (uid: string): { type: 'skin' | 'plastic'; path: string[] } => {
//     const [type, ...pathParts] = uid.split('/');
//     return { type: type as 'skin' | 'plastic', path: pathParts };
//   };

//   const getNameFromPath = (path: string[], type: 'skin' | 'plastic'): string => {
//     const categoriesData = type === 'skin' ? SKIN_BEAUTY_CATEGORIES : PLASTIC_SURGERY_CATEGORIES;

//     let currentNode: CategoryNodeTag | undefined;
//     const labels: string[] = [];

//     for (let i = 0; i < path.length; i++) {
//       const key = path[i];

//       if (i === 0) {
//         currentNode = categoriesData.find(cat => cat.key === key);
//       } else {
//         currentNode = currentNode?.children?.find(child => child.key === key);
//       }

//       if (currentNode) {
//         labels.push(currentNode.ko);
//       }
//     }

//     return labels.join(' > ');
//   };

//   const getGroupedTreatments = () => {
//     const allTreatments = [
//       ...Array.from(selectedSkinTreatments).map(uid => ({ uid, ...parseUid(uid) })),
//       ...Array.from(selectedPlasticTreatments).map(uid => ({ uid, ...parseUid(uid) })),
//     ];

//     const skinGrouped = new Map<string, string[]>();
//     const plasticGrouped = new Map<string, string[]>();

//     allTreatments.forEach(({ uid, type, path }) => {
//       const depth1Key = path[0];
//       const targetMap = type === 'skin' ? skinGrouped : plasticGrouped;

//       if (!targetMap.has(depth1Key)) {
//         targetMap.set(depth1Key, []);
//       }
//       targetMap.get(depth1Key)!.push(getNameFromPath(path, type));
//     });

//     return { skinGrouped, plasticGrouped };
//   };

//   const getGroupedDevices = () => {
//     const grouped = new Map<string, Device[]>();

//     (deviceList as Device[]).forEach(device => {
//       if (selectedDevices.has(device.id)) {
//         if (!grouped.has(device.group)) {
//           grouped.set(device.group, []);
//         }
//         grouped.get(device.group)!.push(device);
//       }
//     });

//     return Array.from(grouped.entries());
//   };

//   if (!isOpen) return null;

//   const { skinGrouped, plasticGrouped } = getGroupedTreatments();
//   const groupedDevices = getGroupedDevices();

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

//       <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4">
//         <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
//           <h2 className="text-xl font-bold">Preview Selected Items</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
//           >
//             ×
//           </button>
//         </div>

//         <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
//           <section className="mb-8">
//             <h3 className="text-lg font-bold mb-4 pb-2 border-b-2 border-blue-500">Treatments</h3>

//             {skinGrouped.size === 0 && plasticGrouped.size === 0 ? (
//               <div className="text-gray-400 text-center py-8">No treatments selected</div>
//             ) : (
//               <div className="space-y-6">
//                 {skinGrouped.size > 0 && (
//                   <div>
//                     <h4 className="text-md font-semibold text-blue-600 mb-3">Skin Beauty</h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {Array.from(skinGrouped.entries()).map(([depth1Key, items]) => {
//                         const depth1Node = SKIN_BEAUTY_CATEGORIES.find(cat => cat.key === depth1Key);
//                         return (
//                           <div key={depth1Key} className="bg-blue-50 rounded-lg p-4">
//                             <div className="font-medium text-blue-800 mb-2">
//                               {depth1Node?.ko || depth1Key}
//                             </div>
//                             <ul className="space-y-1">
//                               {items.map((item, idx) => (
//                                 <li key={idx} className="text-sm text-gray-700 pl-2">
//                                   • {item}
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 )}

//                 {plasticGrouped.size > 0 && (
//                   <div>
//                     <h4 className="text-md font-semibold text-purple-600 mb-3">Plastic Surgery</h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {Array.from(plasticGrouped.entries()).map(([depth1Key, items]) => {
//                         const depth1Node = PLASTIC_SURGERY_CATEGORIES.find(cat => cat.key === depth1Key);
//                         return (
//                           <div key={depth1Key} className="bg-purple-50 rounded-lg p-4">
//                             <div className="font-medium text-purple-800 mb-2">
//                               {depth1Node?.ko || depth1Key}
//                             </div>
//                             <ul className="space-y-1">
//                               {items.map((item, idx) => (
//                                 <li key={idx} className="text-sm text-gray-700 pl-2">
//                                   • {item}
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </section>

//           <section>
//             <h3 className="text-lg font-bold mb-4 pb-2 border-b-2 border-green-500">Devices</h3>

//             {groupedDevices.length === 0 ? (
//               <div className="text-gray-400 text-center py-8">No devices selected</div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {groupedDevices.map(([group, devices]) => (
//                   <div key={group} className="bg-green-50 rounded-lg p-4">
//                     <div className="font-medium text-green-800 mb-2">{group}</div>
//                     <ul className="space-y-1">
//                       {devices.map(device => (
//                         <li key={device.id} className="text-sm text-gray-700 pl-2">
//                           • {device.ko}
//                           {device.type !== 'device' && (
//                             <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-200 rounded">
//                               {device.type === 'drug' ? 'Drug' : 'Program'}
//                             </span>
//                           )}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </section>
//         </div>

//         <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end">
//           <button
//             onClick={onClose}
//             className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PreviewModal;
