import { Box } from '@rocket.chat/fuselage';
import { useOutsideClick } from '@rocket.chat/fuselage-hooks';
import type { ComponentProps } from 'react';
import React, { forwardRef, useRef, useState, useEffect } from 'react';

const DropDownListWrapper = forwardRef<Element, ComponentProps<typeof Box> & { onClose: (e: MouseEvent) => void }>(
	function CategoryDropDownListWrapper({ children, onClose }) {
		const target = useRef<HTMLElement>(null);
		useOutsideClick([target], onClose);

		function getWindowSize(): { innerWidth: number; innerHeight: number } {
			const { innerWidth, innerHeight } = window;
			return { innerWidth, innerHeight };
		}

		const [windowSize, setWindowSize] = useState(getWindowSize());

		useEffect(() => {
			function handleWindowResize(): void {
				setWindowSize(getWindowSize());
			}

			window.addEventListener('resize', handleWindowResize);

			return (): void => {
				window.removeEventListener('resize', handleWindowResize);
			};
		}, []);

		return (
			<Box ref={target} maxHeight={16} maxWidth={224} zIndex='99999' position='relative' overflowY='initial'>
				<div
					style={
						windowSize.innerWidth > 1024
							? {
									position: 'absolute',
									top: 40,
									right: 2.8,
							  }
							: {
									position: 'relative',
									marginTop: 4,
							  }
					}
				>
					{children}
				</div>
			</Box>
		);
	},
);

export default DropDownListWrapper;
