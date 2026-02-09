function RepublishBadge({ republishCount }) {
    if (republishCount === 0) {
        return (
            <span className="px-3 py-1 bg-gradient-to-r from-amber-200 to-amber-600 text-amber-900 text-xs font-bold rounded-full">
                NEW
            </span>
        );
    } else if (republishCount >= 2) {
        return (
            <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                OLD
            </span>
        );
    }
    return null;
}

export default RepublishBadge;
