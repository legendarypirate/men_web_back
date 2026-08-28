function normalizeEndMediaItems(stage) {
  const json = stage.toJSON ? stage.toJSON() : stage;

  if (Array.isArray(json.endMediaItems) && json.endMediaItems.length > 0) {
    return json.endMediaItems
      .filter((item) => item && item.url && item.type)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((item, index) => ({
        id: item.id || `item-${json.id}-${index + 1}`,
        type: item.type,
        url: item.url,
        title: item.title || '',
        caption: item.caption || '',
        sortOrder: item.sortOrder ?? index,
      }));
  }

  if (json.endMediaType && json.endMediaType !== 'none' && json.endMediaUrl) {
    return [
      {
        id: `legacy-${json.id}`,
        type: json.endMediaType,
        url: json.endMediaUrl,
        title: json.endMediaTitle || '',
        caption: json.endMediaCaption || '',
        sortOrder: 0,
      },
    ];
  }

  return [];
}

function syncLegacyMediaFields(items) {
  const first = items[0];
  if (!first) {
    return {
      endMediaType: 'none',
      endMediaUrl: null,
      endMediaTitle: null,
      endMediaCaption: null,
    };
  }
  return {
    endMediaType: first.type,
    endMediaUrl: first.url,
    endMediaTitle: first.title || null,
    endMediaCaption: first.caption || null,
  };
}

module.exports = { normalizeEndMediaItems, syncLegacyMediaFields };
