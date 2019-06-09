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
 * The RequestType enumeration describes the type of requests made by Users, Developers or Moderators. Requests also serve as a moderation log.
 */
const RequestType = {
	/**
	 * This type is used when a User reports a package or review for breaking the rules (eg. racism)
	 */
	USER_REPORT: 1,
	
	/**
	 * This type is used when a User requests a refund. Pakketti wasn't originally designed for paid packages, but for the sake of completion this is added anyways
	 */
	REFUND: 2,
	
	/** 
	 * This type is used when a User applies as a Developer 
	 */
	DEV_APPLICATION: 3,
	
	/**
	 *  This type is used when a User applies as a Moderator
	 */
	MOD_APPLICATION: 4,
	
	/**
	 * This type is used when a Moderator creates a deletion request for a package because it doesn't meet quality standards or is breaking the rules, eg. it has been edited after it was accepted.
	 */
	DELETE_REQUEST: 5
};

module.exports = {
	UserRole: UserRole,
	RequestType: RequestType
};