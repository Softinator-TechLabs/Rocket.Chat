import type { ReactNode } from 'react';
import React from 'react';

import { OmnichannelRoomIconProvider } from '../components/RoomIcon/OmnichannelRoomIcon/provider/OmnichannelRoomIconProvider';
import ActionManagerProvider from './ActionManagerProvider';
import AuthenticationProvider from './AuthenticationProvider/AuthenticationProvider';
import AuthorizationProvider from './AuthorizationProvider';
import AvatarUrlProvider from './AvatarUrlProvider';
import { CallProvider } from './CallProvider';
import ConnectionStatusProvider from './ConnectionStatusProvider';
import CustomSoundProvider from './CustomSoundProvider';
import { DeviceProvider } from './DeviceProvider/DeviceProvider';
import EmojiPickerProvider from './EmojiPickerProvider';
import LayoutProvider from './LayoutProvider';
import ModalProvider from './ModalProvider/ModalProvider';
import OmnichannelProvider from './OmnichannelProvider';
import RouterProvider from './RouterProvider';
import ServerProvider from './ServerProvider';
import SessionProvider from './SessionProvider';
import SettingsProvider from './SettingsProvider';
import ToastMessagesProvider from './ToastMessagesProvider';
import TooltipProvider from './TooltipProvider';
import TranslationProvider from './TranslationProvider';
import UserPresenceProvider from './UserPresenceProvider';
import UserProvider from './UserProvider';
import VideoConfProvider from './VideoConfProvider';

type MeteorProviderProps = {
	children: ReactNode;
};

const MeteorProvider = ({ children }: MeteorProviderProps) => (
	<ConnectionStatusProvider>
		<ServerProvider>
			<RouterProvider>
				<SettingsProvider>
					<TranslationProvider>
						<SessionProvider>
							<TooltipProvider>
								<ToastMessagesProvider>
									<LayoutProvider>
										<AvatarUrlProvider>
											<UserProvider>
												<AuthenticationProvider>
													<CustomSoundProvider>
														<DeviceProvider>
															<ModalProvider>
																<AuthorizationProvider>
																	<EmojiPickerProvider>
																		<OmnichannelRoomIconProvider>
																			<UserPresenceProvider>
																				<ActionManagerProvider>
																					<VideoConfProvider>
																						<CallProvider>
																							<OmnichannelProvider>{children}</OmnichannelProvider>
																						</CallProvider>
																					</VideoConfProvider>
																				</ActionManagerProvider>
																			</UserPresenceProvider>
																		</OmnichannelRoomIconProvider>
																	</EmojiPickerProvider>
																</AuthorizationProvider>
															</ModalProvider>
														</DeviceProvider>
													</CustomSoundProvider>
												</AuthenticationProvider>
											</UserProvider>
										</AvatarUrlProvider>
									</LayoutProvider>
								</ToastMessagesProvider>
							</TooltipProvider>
						</SessionProvider>
					</TranslationProvider>
				</SettingsProvider>
			</RouterProvider>
		</ServerProvider>
	</ConnectionStatusProvider>
);

export default MeteorProvider;
