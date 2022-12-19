import type { IServerEvent } from '@rocket.chat/core-typings';
import { ServerEventType } from '@rocket.chat/core-typings';
import { Rooms, ServerEvents, Users } from '@rocket.chat/models';

import { addMinutesToADate } from '../../../../lib/utils/addMinutesToADate';
import { getClientAddress } from '../../../../server/lib/getClientAddress';
import { sendMessage } from '../../../lib/server/functions';
import { Logger } from '../../../logger/server';
import { settings } from '../../../settings/server';
import type { ILoginAttempt } from '../ILoginAttempt';

const logger = new Logger('LoginProtection');

export const notifyFailedLogin = async (ipOrUsername: string, blockedUntil: Date, failedAttempts: number): Promise<void> => {
	const channelToNotify = settings.get('Block_Multiple_Failed_Logins_Notify_Failed_Channel');
	if (!channelToNotify) {
		logger.error('Cannot notify failed logins: channel provided is invalid');
		return;
	}
	// verify channel exists
	// to avoid issues when "fname" is presented in the UI, check if the name matches it as well
	const room = await Rooms.findOneByNameOrFname(channelToNotify);
	if (!room) {
		logger.error("Cannot notify failed logins: channel provided doesn't exists");
		return;
	}

	const rocketCat = await Users.findOneById('rocket.cat');
	// send message
	const message = {
		attachments: [
			{
				fields: [
					{
						title: 'Failed login attempt threshold exceeded',
						value: `User or IP: ${ipOrUsername}\nBlocked until: ${blockedUntil}\nFailed Attempts: ${failedAttempts}`,
						short: true,
					},
				],
				color: 'red',
			},
		],
	};

	await sendMessage(rocketCat, message, room, false);
};

export const isValidLoginAttemptByIp = async (login: ILoginAttempt): Promise<boolean> => {
	const ip = getClientAddress(login.connection);
	const whitelist = String(settings.get('Block_Multiple_Failed_Logins_Ip_Whitelist')).split(',');

	if (
		!settings.get('Block_Multiple_Failed_Logins_Enabled') ||
		!settings.get('Block_Multiple_Failed_Logins_By_Ip') ||
		whitelist.includes(ip)
	) {
		return true;
	}

	const lastLoginOrBlock = await ServerEvents.findLastLoginOrBlockByIp(ip);
	let failedAttemptsSinceLastLoginOrBlock;
	const lastTs = lastLoginOrBlock?.blockedUntil || lastLoginOrBlock?.ts;

	if (!lastLoginOrBlock || !lastTs) {
		failedAttemptsSinceLastLoginOrBlock = await ServerEvents.countFailedAttemptsByIp(ip);
	} else {
		failedAttemptsSinceLastLoginOrBlock = await ServerEvents.countFailedAttemptsByIpSince(ip, new Date(lastTs));
	}

	if (lastTs && lastTs > new Date()) {
		return false;
	}

	const attemptsUntilBlock = settings.get('Block_Multiple_Failed_Logins_Attempts_Until_Block_By_Ip');

	if (attemptsUntilBlock && failedAttemptsSinceLastLoginOrBlock < attemptsUntilBlock) {
		return true;
	}

	const lastAttemptAt = (await ServerEvents.findLastFailedAttemptByIp(ip))?.ts;

	if (!lastAttemptAt) {
		return true;
	}

	const minutesUntilUnblock = settings.get('Block_Multiple_Failed_Logins_Time_To_Unblock_By_Ip_In_Minutes') as number;
	const willBeBlockedUntil = addMinutesToADate(new Date(), minutesUntilUnblock);
	await saveBlockedLogin(login, willBeBlockedUntil);

	if (settings.get('Block_Multiple_Failed_Logins_Notify_Failed')) {
		notifyFailedLogin(ip, willBeBlockedUntil, failedAttemptsSinceLastLoginOrBlock);
	}

	return false;
};

export const isValidAttemptByUser = async (login: ILoginAttempt): Promise<boolean> => {
	if (!settings.get('Block_Multiple_Failed_Logins_Enabled') || !settings.get('Block_Multiple_Failed_Logins_By_User')) {
		return true;
	}

	const loginUsername = login.methodArguments[0].user?.username;
	const user = login.user || (loginUsername && (await Users.findOneByUsername(loginUsername))) || undefined;

	if (!user?.username) {
		return true;
	}

	const lastLoginOrBlock = await ServerEvents.findLastLoginOrBlockByUsername(user.username);

	let failedAttemptsSinceLastLoginOrBlock;

	const lastTs = lastLoginOrBlock?.blockedUntil || lastLoginOrBlock?.ts;

	if (!lastTs) {
		failedAttemptsSinceLastLoginOrBlock = await ServerEvents.countFailedAttemptsByUsername(user.username);
	} else {
		failedAttemptsSinceLastLoginOrBlock = await ServerEvents.countFailedAttemptsByUsernameSince(user.username, new Date(lastTs));
	}

	if (lastTs && lastTs > new Date()) {
		return false;
	}

	const attemptsUntilBlock = settings.get('Block_Multiple_Failed_Logins_Attempts_Until_Block_by_User');

	if (attemptsUntilBlock && failedAttemptsSinceLastLoginOrBlock < attemptsUntilBlock) {
		return true;
	}

	const lastAttemptAt = (await ServerEvents.findLastFailedAttemptByUsername(user.username as string))?.ts;

	if (!lastAttemptAt) {
		return true;
	}

	const minutesUntilUnblock = settings.get('Block_Multiple_Failed_Logins_Time_To_Unblock_By_User_In_Minutes') as number;
	const willBeBlockedUntil = addMinutesToADate(new Date(), minutesUntilUnblock);
	await saveBlockedLogin(login, willBeBlockedUntil);

	if (settings.get('Block_Multiple_Failed_Logins_Notify_Failed')) {
		notifyFailedLogin(user.username, willBeBlockedUntil, failedAttemptsSinceLastLoginOrBlock);
	}

	return false;
};

export const saveFailedLoginAttempts = async (login: ILoginAttempt): Promise<void> => {
	const user: IServerEvent['u'] = {
		_id: login.user?._id,
		username: login.user?.username || login.methodArguments[0].user?.username,
	};

	await ServerEvents.insertOne({
		ip: getClientAddress(login.connection),
		t: ServerEventType.FAILED_LOGIN_ATTEMPT,
		ts: new Date(),
		u: user,
	});
};

export const saveBlockedLogin = async (login: ILoginAttempt, blockedUntil: Date): Promise<void> => {
	const user: IServerEvent['u'] = {
		_id: login.user?._id,
		username: login.user?.username || login.methodArguments[0].user?.username,
	};

	await ServerEvents.insertOne({
		ip: getClientAddress(login.connection),
		t: ServerEventType.BLOCKED_AT,
		ts: new Date(),
		blockedUntil,
		u: user,
	});
};

export const saveSuccessfulLogin = async (login: ILoginAttempt): Promise<void> => {
	const user: IServerEvent['u'] = {
		_id: login.user?._id,
		username: login.user?.username || login.methodArguments[0].user?.username,
	};

	await ServerEvents.insertOne({
		ip: getClientAddress(login.connection),
		t: ServerEventType.LOGIN,
		ts: new Date(),
		u: user,
	});
};
