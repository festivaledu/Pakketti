/**
 * The UserRole describes a user's role and therefore their rights. A user can have multiple roles (eg. User and Developer), so the "role" flag in the database is calculated using binary addition (eg. User (2) + Developer (4) = 6). The root user (defined in config/config.json) automatically has every role, resulting in a "role" flag of 31.
 */
const UserRole = {
	/**
	 * The Migrate role is used for migrating packages, package versions, reviews, ratings and devices from one project version to another, if there was no onwner previously.
	 */
	MIGRATE: 1,
	
	/**
	 * This is the default role for registered users. It allows them to write reviews, link their devices or apply as a developer/moderator.
	 */
	USER: 2,
	
	/**
	 * The Developer role allows users to create packages and engage with other users through package reviews. A user has to apply as a Developer using an existing package, which will then be checked for quality standards. If the package meets these standards, the Developer role application will most likely be accepted. If a Developer breaks the rules too many times, he will either be downgraded to a User (with all packages made unavailable for download) or completely removed.
	 */
	DEVELOPER: 4,
	
	/**
	 * The Moderator can see all packages as read-only. If he identifies a package that doesn't conform to a commom set of rules, he can create a deletion request for the Administrator(s). He can also read through all reviews and delete them on his own if required (an internal request is created anyways and marked as resolved). Moderator applications can only be accepted if the applicant has a "clean history" (eg. no deleted packges because of breaking the common rule set)
	 */
	MODERATOR: 8,
	
	/**
	 * The Administrator can delete packages (next to reviews) if requested by Moderators or on his own behalf, and he can see the whole internal Moderation log. An Administrator is also responsible for accepting or denying Developer/Moderator applications.
	 */
	ADMINISTRATOR: 16,
	
	/**
	 * The automatically created root user can do everything of the above – create, manage and delete packages, delete package reviews, manage users etc. – as well as managing the repository itself (name, icon and additional APT information)
	 */
	ROOT: 1 | 2 | 4 | 8 | 16
};

/**
 * The LogItemType enumeration describes the type of log items created by certain actions inside the API. Log Items that have been automatically created by the API (thus serving their actual logging purpose) are marked as being used for the log (status = 2). Other items, such as DevApplication are used for User Requests.
 */
const LogItemType = {
	/**
	 * This type is used when the API has finished the startup process
	 */
	API_STARTUP: 1,
	
	/**
	 * This type is used when a User has created an account
	 */
	USER_REGISTRATION: 2,
	
	/**
	 * This type is used when a User successfully logged in. Failed login attempts are ignored
	 */
	USER_LOGIN: 3,
	
	/**
	 * This type is used when a User has edited themselves (username, password, etc)
	 */
	USER_EDITED: 4,
	
	/**
	 * This type is used when a User's role has been downgraded by a Moderator or Administrator (punishment or request fulfilment)
	 */
	USER_ROLE_DOWNGRADED: 5,
	
	/**
	 * This type is used when a User deletes themselves or has been deleted by an Adminstrator
	 */
	USER_DELETED: 6,
	
	/**
	 * This type is used when a Developer created a package
	 */
	PACKAGE_CREATED: 7,
	
	/**
	 * This type is used when a Developer or Moderator edited a package
	 */
	PACKAGE_EDITED: 8,
	
	/**
	 * This type is used when a Developer or Administrator deleted a package
	 */
	PACKAGE_DELETED: 9,
	
	/**
	 * This type is used when a Developer created a package version
	 */
	VERSION_CREATED: 10,
	
	/**
	 * This type is used when a Developer or Moderator edited a package version
	 */
	VERSION_EDITED: 11,
	
	/**
	 * This type is used when a Developer or Administrator deleted a package version
	 */
	VERSION_DELETED: 12,
	
	/**
	 * This type is used when a User created a package review
	 */
	REVIEW_CREATED: 13,
	
	/**
	 * This type is used when a User edited a package review or rating
	 */
	REVIEW_EDITED: 14,
	
	/**
	 * This type is used when a User, Developer or Moderator deleted a package review
	 */
	REVIEW_DELETED: 15,
	
	/**
	 * This type is used when a User or Developer adds a message to a review
	 */
	REVIEW_MESSAGE_CREATED: 16,
	
	/**
	 * This type is used when a User or Developer edits their review message
	 */
	REVIEW_MESSAGE_EDITED: 17,
	
	/**
	 * This type is used when a User or Developer deletes their review message
	 */
	REVIEW_MESSAGE_DELETED: 18,
	
	/**
	 * This type is used when a User manually creates a device
	 */
	DEVICE_CREATED: 19,
	
	/**
	 * This type is used when a User enrolls an iOS device using a Configuration Profile
	 */
	DEVICE_LINKED: 20,
	
	/**
	 * This type is used when a User updates a device
	 */
	DEVICE_UPDATED: 21,
	
	/**
	 * This type is used when a User deletes a device
	 */
	DEVICE_DELETED: 22,
	
	
	
	/**
	 * This type is used when a User requests a refund for a paid package. Pakketti wasn't originally designed for paid packages, but for the sake of completion this is added anyways
	 */
	REFUND: 33,
	
	/**
	 * This type is used when a User creates a report against another User, a package or a review
	 */
	USER_REPORT: 34,
	
	/** 
	 * This type is used when a User applies as a Developer 
	 */
	DEV_APPLICATION: 35,
	
	/** 
	 * This type is used when a User applies as a Moderator 
	 */
	MOD_APPLICATION: 36,
	
	/**
	 * This type is used when a Developer or Moderator wants to step down from either role
	 */
	ROLE_DOWNGRADE: 37,
	
	/**
	 * This type is used when a Moderator creates a deletion request for a package because it doesn't meet quality standards or is breaking the rules, eg. it has been edited after it was accepted, or a Developer wants to delete his account, but has associated packages
	 */
	DELETE_REQUEST: 38
};

module.exports = {
	UserRole: UserRole,
	LogItemType: LogItemType
};