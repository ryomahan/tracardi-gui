export function getProfileById(id) {
    return {
        url: `/profile/${id}`
    }
}

export function getProfileEvents(profileId) {
    return {
        url: `/events/profile/${profileId}`
    }
}

export function getProfileSession(profileId, offset) {
    return {
        url: `/session/profile/${profileId}?n=${-offset}`
    }
}

export function getProfileLogs(profileId) {
    return {url: `/profile/logs/${profileId}?sort=desc`}
}

export function getProfilesCount() {
    return {
        url: "profile/count"
    }
}