/**

@author: felixmariotto https://raw.githubusercontent.com/felixmariotto/three-mesh-ui/master/src/utils/Keymaps.js

Contains key maps for the Keyboard component.
Most languages need a specific keyboard. Therefore, Keyboard takes a language attribute
and if not passed tries to detect the language. If not found, it uses the basic QZERTY layout.

 */
const keymaps = {

	// french
	fr:[
		[
			[
				{ width: 0.1, chars: [ { lowerCase: 'a', upperCase: 'A' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'z', upperCase: 'Z' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'e', upperCase: 'E' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'r', upperCase: 'R' } ] },
				{ width: 0.1, chars: [ { lowerCase: 't', upperCase: 'T' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'y', upperCase: 'Y' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'u', upperCase: 'U' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'i', upperCase: 'I' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'o', upperCase: 'O' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'p', upperCase: 'P' } ] }
			],

			[
				{ width: 0.1, chars: [ { lowerCase: 'q', upperCase: 'Q' } ] },
				{ width: 0.1, chars: [ { lowerCase: 's', upperCase: 'S' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'd', upperCase: 'D' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'f', upperCase: 'F' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'g', upperCase: 'G' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'h', upperCase: 'H' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'j', upperCase: 'J' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'k', upperCase: 'K' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'l', upperCase: 'L' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'm', upperCase: 'M' } ] }
			],

			[
				{ width: 0.2, command: 'shift', chars: [ { icon: 'shift' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'w', upperCase: 'W' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'x', upperCase: 'X' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'c', upperCase: 'C' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'v', upperCase: 'V' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'b', upperCase: 'B' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'n', upperCase: 'N' } ] },
				{ width: 0.2, command: 'backspace', chars: [ { icon: 'backspace' } ] }
			],

			[
				{ width: 0.2, command: 'switch', chars: [ { lowerCase: '.?12' } ] },
				{ width: 0.1, chars: [ { lowerCase: ',' } ] },
				{ width: 0.4, command: 'space', chars: [ { icon: 'space' } ] },
				{ width: 0.1, chars: [ { lowerCase: '.' } ] },
				{ width: 0.2, command: 'enter', chars: [ { icon: 'enter' } ] }
			]

		],

		[
			[
				{ width: 0.1, chars: [ { lowerCase: '1' } ] },
				{ width: 0.1, chars: [ { lowerCase: '2' } ] },
				{ width: 0.1, chars: [ { lowerCase: '3' } ] },
				{ width: 0.1, chars: [ { lowerCase: '4' } ] },
				{ width: 0.1, chars: [ { lowerCase: '5' } ] },
				{ width: 0.1, chars: [ { lowerCase: '6' } ] },
				{ width: 0.1, chars: [ { lowerCase: '7' } ] },
				{ width: 0.1, chars: [ { lowerCase: '8' } ] },
				{ width: 0.1, chars: [ { lowerCase: '9' } ] },
				{ width: 0.1, chars: [ { lowerCase: '0' } ] }
			],

			[
				{ width: 0.1, chars: [ { lowerCase: '@' } ] },
				{ width: 0.1, chars: [ { lowerCase: '#' } ] },
				{ width: 0.1, chars: [ { lowerCase: '|' } ] },
				{ width: 0.1, chars: [ { lowerCase: '_' } ] },
				{ width: 0.1, chars: [ { lowerCase: '&' } ] },
				{ width: 0.1, chars: [ { lowerCase: '-' } ] },
				{ width: 0.1, chars: [ { lowerCase: '+' } ] },
				{ width: 0.1, chars: [ { lowerCase: '(' } ] },
				{ width: 0.1, chars: [ { lowerCase: ')' } ] },
				{ width: 0.1, chars: [ { lowerCase: '/' } ] }
			],

			[
				{ width: 0.1, chars: [ { lowerCase: '=' } ] },
				{ width: 0.1, chars: [ { lowerCase: '*' } ] },
				{ width: 0.1, chars: [ { lowerCase: '"' } ] },
				{ width: 0.1, chars: [ { lowerCase: '\'' } ] },
				{ width: 0.1, chars: [ { lowerCase: ':' } ] },
				{ width: 0.1, chars: [ { lowerCase: ';' } ] },
				{ width: 0.1, chars: [ { lowerCase: '!' } ] },
				{ width: 0.1, chars: [ { lowerCase: '?' } ] },
				{ width: 0.2, command: 'backspace', chars: [ { icon: 'backspace' } ] }
			],

			[
				{ width: 0.2, command: 'switch', chars: [ { lowerCase: '.?12' } ] },
				{ width: 0.1, chars: [ { lowerCase: ',' } ] },
				{ width: 0.4, command: 'space', chars: [ { icon: 'space' } ] },
				{ width: 0.1, chars: [ { lowerCase: '.' } ] },
				{ width: 0.2, command: 'enter', chars: [ { icon: 'enter' } ] }
			]
		]
	],

	// english
	eng:[
		[
			[
				{ width: 0.1, chars: [ { lowerCase: 'q', upperCase: 'Q' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'w', upperCase: 'W' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'e', upperCase: 'E' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'r', upperCase: 'R' } ] },
				{ width: 0.1, chars: [ { lowerCase: 't', upperCase: 'T' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'y', upperCase: 'Y' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'u', upperCase: 'U' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'i', upperCase: 'I' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'o', upperCase: 'O' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'p', upperCase: 'P' } ] }
			],

			[
				{ width: 0.1, chars: [ { lowerCase: 'a', upperCase: 'A' } ] },
				{ width: 0.1, chars: [ { lowerCase: 's', upperCase: 'S' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'd', upperCase: 'D' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'f', upperCase: 'F' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'g', upperCase: 'G' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'h', upperCase: 'H' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'j', upperCase: 'J' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'k', upperCase: 'K' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'l', upperCase: 'L' } ] }
			],

			[
				{ width: 0.15, command: 'shift', chars: [ { icon: 'shift' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'z', upperCase: 'Z' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'x', upperCase: 'X' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'c', upperCase: 'C' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'v', upperCase: 'V' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'b', upperCase: 'B' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'n', upperCase: 'N' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'm', upperCase: 'M' } ] },
				{ width: 0.15, command: 'backspace', chars: [ { icon: 'backspace' } ] }
			],

			[
				{ width: 0.2, command: 'switch', chars: [ { lowerCase: '.?12' } ] },
				{ width: 0.1, chars: [ { lowerCase: ',' } ] },
				{ width: 0.4, command: 'space', chars: [ { icon: 'space' } ] },
				{ width: 0.1, chars: [ { lowerCase: '.' } ] },
				{ width: 0.2, command: 'enter', chars: [ { icon: 'enter' } ] }
			]

		],

		[
			[
				{ width: 0.1, chars: [ { lowerCase: '1' } ] },
				{ width: 0.1, chars: [ { lowerCase: '2' } ] },
				{ width: 0.1, chars: [ { lowerCase: '3' } ] },
				{ width: 0.1, chars: [ { lowerCase: '4' } ] },
				{ width: 0.1, chars: [ { lowerCase: '5' } ] },
				{ width: 0.1, chars: [ { lowerCase: '6' } ] },
				{ width: 0.1, chars: [ { lowerCase: '7' } ] },
				{ width: 0.1, chars: [ { lowerCase: '8' } ] },
				{ width: 0.1, chars: [ { lowerCase: '9' } ] },
				{ width: 0.1, chars: [ { lowerCase: '0' } ] }
			],

			[
				{ width: 0.1, chars: [ { lowerCase: '@' } ] },
				{ width: 0.1, chars: [ { lowerCase: '#' } ] },
				{ width: 0.1, chars: [ { lowerCase: '|' } ] },
				{ width: 0.1, chars: [ { lowerCase: '_' } ] },
				{ width: 0.1, chars: [ { lowerCase: '&' } ] },
				{ width: 0.1, chars: [ { lowerCase: '-' } ] },
				{ width: 0.1, chars: [ { lowerCase: '+' } ] },
				{ width: 0.1, chars: [ { lowerCase: '(' } ] },
				{ width: 0.1, chars: [ { lowerCase: ')' } ] },
				{ width: 0.1, chars: [ { lowerCase: '/' } ] }
			],

			[
				{ width: 0.1, chars: [ { lowerCase: '=' } ] },
				{ width: 0.1, chars: [ { lowerCase: '*' } ] },
				{ width: 0.1, chars: [ { lowerCase: '"' } ] },
				{ width: 0.1, chars: [ { lowerCase: '\'' } ] },
				{ width: 0.1, chars: [ { lowerCase: ':' } ] },
				{ width: 0.1, chars: [ { lowerCase: ';' } ] },
				{ width: 0.1, chars: [ { lowerCase: '!' } ] },
				{ width: 0.1, chars: [ { lowerCase: '?' } ] },
				{ width: 0.2, command: 'backspace', chars: [ { icon: 'backspace' } ] }
			],

			[
				{ width: 0.2, command: 'switch', chars: [ { lowerCase: '.?12' } ] },
				{ width: 0.1, chars: [ { lowerCase: ',' } ] },
				{ width: 0.4, command: 'space', chars: [ { icon: 'space' } ] },
				{ width: 0.1, chars: [ { lowerCase: '.' } ] },
				{ width: 0.2, command: 'enter', chars: [ { icon: 'enter' } ] }
			]
		]
	],

	// russian
	ru:[
		[
			[
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'q', upperCase: 'Q' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'w', upperCase: 'W' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'e', upperCase: 'E' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'r', upperCase: 'R' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 't', upperCase: 'T' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'y', upperCase: 'Y' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'u', upperCase: 'U' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'i', upperCase: 'I' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'o', upperCase: 'O' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'p', upperCase: 'P' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: '{', upperCase: '[' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: '}', upperCase: ']' } ] }
			],

			[
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'a', upperCase: 'A' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 's', upperCase: 'S' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'd', upperCase: 'D' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'f', upperCase: 'F' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'g', upperCase: 'G' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'h', upperCase: 'H' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'j', upperCase: 'J' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'k', upperCase: 'K' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'l', upperCase: 'L' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: ':', upperCase: ';' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: '"', upperCase: '\'' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: '|', upperCase: '\\' } ] }
			],

			[
				{ width: 1.5 / 12, command: 'shift', chars: [ { icon: 'shift' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'z', upperCase: 'Z' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'x', upperCase: 'X' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'c', upperCase: 'C' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'v', upperCase: 'V' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'b', upperCase: 'B' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'n', upperCase: 'N' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'm', upperCase: 'M' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: ',', upperCase: '' } ] },
				{ width: 1 / 12, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: '.', upperCase: '' } ] },
				{ width: 1.5 / 12, command: 'backspace', chars: [ { icon: 'backspace' } ] }
			],

			[
				{ width: 0.15, command: 'switch-set', chars: [ { lowerCase: 'eng' } ] },
				{ width: 0.15, command: 'switch', chars: [ { lowerCase: '.?12' } ] },
				{ width: 0.4, command: 'space', chars: [ { icon: 'space' } ] },
				{ width: 0.1, chars: [ { lowerCase: '?' } ] },
				{ width: 0.2, command: 'enter', chars: [ { icon: 'enter' } ] }
			]
		],

		[
			[
				{ width: 0.1, chars: [ { lowerCase: '1' } ] },
				{ width: 0.1, chars: [ { lowerCase: '2' } ] },
				{ width: 0.1, chars: [ { lowerCase: '3' } ] },
				{ width: 0.1, chars: [ { lowerCase: '4' } ] },
				{ width: 0.1, chars: [ { lowerCase: '5' } ] },
				{ width: 0.1, chars: [ { lowerCase: '6' } ] },
				{ width: 0.1, chars: [ { lowerCase: '7' } ] },
				{ width: 0.1, chars: [ { lowerCase: '8' } ] },
				{ width: 0.1, chars: [ { lowerCase: '9' } ] },
				{ width: 0.1, chars: [ { lowerCase: '0' } ] }
			],

			[
				{ width: 0.1, chars: [ { lowerCase: '@' } ] },
				{ width: 0.1, chars: [ { lowerCase: '#' } ] },
				{ width: 0.1, chars: [ { lowerCase: '|' } ] },
				{ width: 0.1, chars: [ { lowerCase: '_' } ] },
				{ width: 0.1, chars: [ { lowerCase: '&' } ] },
				{ width: 0.1, chars: [ { lowerCase: '-' } ] },
				{ width: 0.1, chars: [ { lowerCase: '+' } ] },
				{ width: 0.1, chars: [ { lowerCase: '(' } ] },
				{ width: 0.1, chars: [ { lowerCase: ')' } ] },
				{ width: 0.1, chars: [ { lowerCase: '/' } ] }
			],

			[
				{ width: 0.1, chars: [ { lowerCase: '=' } ] },
				{ width: 0.1, chars: [ { lowerCase: '*' } ] },
				{ width: 0.1, chars: [ { lowerCase: '"' } ] },
				{ width: 0.1, chars: [ { lowerCase: '\'' } ] },
				{ width: 0.1, chars: [ { lowerCase: ':' } ] },
				{ width: 0.1, chars: [ { lowerCase: ';' } ] },
				{ width: 0.1, chars: [ { lowerCase: '!' } ] },
				{ width: 0.1, chars: [ { lowerCase: '?' } ] },
				{ width: 0.2, command: 'backspace', chars: [ { icon: 'backspace' } ] }
			],

			[
				{ width: 0.3, command: 'switch', chars: [ { lowerCase: '??????' } ] },
				{ width: 0.4, command: 'space', chars: [ { icon: 'space' } ] },
				{ width: 0.1, chars: [ { lowerCase: '.' } ] },
				{ width: 0.2, command: 'enter', chars: [ { icon: 'enter' } ] }
			]
		]
	],

	// germany
	de:[
		[
			[
				{ width: 1 / 11, chars: [ { lowerCase: 'q', upperCase: 'Q' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'w', upperCase: 'W' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'e', upperCase: 'E' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'r', upperCase: 'R' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 't', upperCase: 'T' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'z', upperCase: 'Z' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'u', upperCase: 'U' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'i', upperCase: 'I' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'o', upperCase: 'O' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'p', upperCase: 'P' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: '??', upperCase: '??' } ] }
			],

			[
				{ width: 1 / 11, chars: [ { lowerCase: 'a', upperCase: 'A' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 's', upperCase: 'S' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'd', upperCase: 'D' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'f', upperCase: 'F' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'g', upperCase: 'G' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'h', upperCase: 'H' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'j', upperCase: 'J' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'k', upperCase: 'K' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'l', upperCase: 'L' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: '??', upperCase: '??' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: '??', upperCase: '??' } ] }
			],

			[
				{ width: 2 / 11, command: 'shift', chars: [ { icon: 'shift' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'y', upperCase: 'Y' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'x', upperCase: 'X' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'c', upperCase: 'C' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'v', upperCase: 'V' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'b', upperCase: 'B' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'n', upperCase: 'N' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'm', upperCase: 'M' } ] },
				{ width: 2 / 11, command: 'backspace', chars: [ { icon: 'backspace' } ] }
			],

			[
				{ width: 0.2, command: 'switch', chars: [ { lowerCase: '.?12' } ] },
				{ width: 0.1, chars: [ { lowerCase: ',' } ] },
				{ width: 0.4, command: 'space', chars: [ { icon: 'space' } ] },
				{ width: 0.1, chars: [ { lowerCase: '.' } ] },
				{ width: 0.2, command: 'enter', chars: [ { icon: 'enter' } ] }
			]
		],

		[
			[
				{ width: 0.1, chars: [ { lowerCase: '1' } ] },
				{ width: 0.1, chars: [ { lowerCase: '2' } ] },
				{ width: 0.1, chars: [ { lowerCase: '3' } ] },
				{ width: 0.1, chars: [ { lowerCase: '4' } ] },
				{ width: 0.1, chars: [ { lowerCase: '5' } ] },
				{ width: 0.1, chars: [ { lowerCase: '6' } ] },
				{ width: 0.1, chars: [ { lowerCase: '7' } ] },
				{ width: 0.1, chars: [ { lowerCase: '8' } ] },
				{ width: 0.1, chars: [ { lowerCase: '9' } ] },
				{ width: 0.1, chars: [ { lowerCase: '0' } ] }
			],

			[
				{ width: 0.1, chars: [ { lowerCase: '@' } ] },
				{ width: 0.1, chars: [ { lowerCase: '#' } ] },
				{ width: 0.1, chars: [ { lowerCase: '|' } ] },
				{ width: 0.1, chars: [ { lowerCase: '_' } ] },
				{ width: 0.1, chars: [ { lowerCase: '&' } ] },
				{ width: 0.1, chars: [ { lowerCase: '-' } ] },
				{ width: 0.1, chars: [ { lowerCase: '+' } ] },
				{ width: 0.1, chars: [ { lowerCase: '(' } ] },
				{ width: 0.1, chars: [ { lowerCase: ')' } ] },
				{ width: 0.1, chars: [ { lowerCase: '/' } ] }
			],

			[
				{ width: 0.1, chars: [ { lowerCase: '=' } ] },
				{ width: 0.1, chars: [ { lowerCase: '*' } ] },
				{ width: 0.1, chars: [ { lowerCase: '"' } ] },
				{ width: 0.1, chars: [ { lowerCase: '\'' } ] },
				{ width: 0.1, chars: [ { lowerCase: ':' } ] },
				{ width: 0.1, chars: [ { lowerCase: ';' } ] },
				{ width: 0.1, chars: [ { lowerCase: '!' } ] },
				{ width: 0.1, chars: [ { lowerCase: '?' } ] },
				{ width: 0.2, command: 'backspace', chars: [ { icon: 'backspace' } ] }
			],

			[
				{ width: 0.2, command: 'switch', chars: [ { lowerCase: '.?12' } ] },
				{ width: 0.1, chars: [ { lowerCase: ',' } ] },
				{ width: 0.4, command: 'space', chars: [ { icon: 'space' } ] },
				{ width: 0.1, chars: [ { lowerCase: '.' } ] },
				{ width: 0.2, command: 'enter', chars: [ { icon: 'enter' } ] }
			]
		]
	],

	// spanish
	es:[
		[
			[
				{ width: 0.1, chars: [ { lowerCase: 'q', upperCase: 'Q' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'w', upperCase: 'W' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'e', upperCase: 'E' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'r', upperCase: 'R' } ] },
				{ width: 0.1, chars: [ { lowerCase: 't', upperCase: 'T' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'y', upperCase: 'Y' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'u', upperCase: 'U' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'i', upperCase: 'I' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'o', upperCase: 'O' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'p', upperCase: 'P' } ] }
			],

			[
				{ width: 0.1, chars: [ { lowerCase: 'a', upperCase: 'A' } ] },
				{ width: 0.1, chars: [ { lowerCase: 's', upperCase: 'S' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'd', upperCase: 'D' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'f', upperCase: 'F' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'g', upperCase: 'G' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'h', upperCase: 'H' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'j', upperCase: 'J' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'k', upperCase: 'K' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'l', upperCase: 'L' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' } ] }
			],

			[
				{ width: 0.15, command: 'shift', chars: [ { icon: 'shift' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'z', upperCase: 'Z' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'x', upperCase: 'X' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'c', upperCase: 'C' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'v', upperCase: 'V' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'b', upperCase: 'B' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'n', upperCase: 'N' } ] },
				{ width: 0.1, chars: [ { lowerCase: 'm', upperCase: 'M' } ] },
				{ width: 0.15, command: 'backspace', chars: [ { icon: 'backspace' } ] }
			],

			[
				{ width: 0.2, command: 'switch', chars: [ { lowerCase: '.?12' } ] },
				{ width: 0.1, chars: [ { lowerCase: ',' } ] },
				{ width: 0.4, command: 'space', chars: [ { icon: 'space' } ] },
				{ width: 0.1, chars: [ { lowerCase: '.' } ] },
				{ width: 0.2, command: 'enter', chars: [ { icon: 'enter' } ] }
			]
		],

		[
			[
				{ width: 0.1, chars: [ { lowerCase: '1' } ] },
				{ width: 0.1, chars: [ { lowerCase: '2' } ] },
				{ width: 0.1, chars: [ { lowerCase: '3' } ] },
				{ width: 0.1, chars: [ { lowerCase: '4' } ] },
				{ width: 0.1, chars: [ { lowerCase: '5' } ] },
				{ width: 0.1, chars: [ { lowerCase: '6' } ] },
				{ width: 0.1, chars: [ { lowerCase: '7' } ] },
				{ width: 0.1, chars: [ { lowerCase: '8' } ] },
				{ width: 0.1, chars: [ { lowerCase: '9' } ] },
				{ width: 0.1, chars: [ { lowerCase: '0' } ] }
			],

			[
				{ width: 0.1, chars: [ { lowerCase: '@' } ] },
				{ width: 0.1, chars: [ { lowerCase: '#' } ] },
				{ width: 0.1, chars: [ { lowerCase: '|' } ] },
				{ width: 0.1, chars: [ { lowerCase: '_' } ] },
				{ width: 0.1, chars: [ { lowerCase: '&' } ] },
				{ width: 0.1, chars: [ { lowerCase: '-' } ] },
				{ width: 0.1, chars: [ { lowerCase: '+' } ] },
				{ width: 0.1, chars: [ { lowerCase: '(' } ] },
				{ width: 0.1, chars: [ { lowerCase: ')' } ] },
				{ width: 0.1, chars: [ { lowerCase: '/' } ] }
			],

			[
				{ width: 0.1, chars: [ { lowerCase: '=' } ] },
				{ width: 0.1, chars: [ { lowerCase: '*' } ] },
				{ width: 0.1, chars: [ { lowerCase: '"' } ] },
				{ width: 0.1, chars: [ { lowerCase: '\'' } ] },
				{ width: 0.1, chars: [ { lowerCase: ':' } ] },
				{ width: 0.1, chars: [ { lowerCase: ';' } ] },
				{ width: 0.1, chars: [ { lowerCase: '!' } ] },
				{ width: 0.1, chars: [ { lowerCase: '?' } ] },
				{ width: 0.2, command: 'backspace', chars: [ { icon: 'backspace' } ] }
			],

			[
				{ width: 0.2, command: 'switch', chars: [ { lowerCase: '.?12' } ] },
				{ width: 0.1, chars: [ { lowerCase: ',' } ] },
				{ width: 0.4, command: 'space', chars: [ { icon: 'space' } ] },
				{ width: 0.1, chars: [ { lowerCase: '.' } ] },
				{ width: 0.2, command: 'enter', chars: [ { icon: 'enter' } ] }
			]
		]
	],

	// greek
	el:[
		[
			[
				{ width: 0.1, chars: [ { lowerCase: ';', upperCase: ':' }, { lowerCase: 'q', upperCase: 'Q' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'w', upperCase: 'W' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'e', upperCase: 'E' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'r', upperCase: 'R' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 't', upperCase: 'T' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'y', upperCase: 'Y' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'u', upperCase: 'U' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'i', upperCase: 'I' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'o', upperCase: 'O' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'p', upperCase: 'P' } ] }
			],

			[
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'a', upperCase: 'A' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 's', upperCase: 'S' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'd', upperCase: 'D' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'f', upperCase: 'F' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'g', upperCase: 'G' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'h', upperCase: 'H' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'j', upperCase: 'J' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'k', upperCase: 'K' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'l', upperCase: 'L' } ] }
			],

			[
				{ width: 0.15, command: 'shift', chars: [ { icon: 'shift' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'z', upperCase: 'Z' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'x', upperCase: 'X' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'c', upperCase: 'C' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'v', upperCase: 'V' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'b', upperCase: 'B' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'n', upperCase: 'N' } ] },
				{ width: 0.1, chars: [ { lowerCase: '??', upperCase: '??' }, { lowerCase: 'm', upperCase: 'M' } ] },
				{ width: 0.15, command: 'backspace', chars: [ { icon: 'backspace' } ] }
			],

			[
				{ width: 0.15, command: 'switch-set', chars: [ { lowerCase: 'eng' } ] },
				{ width: 0.15, command: 'switch', chars: [ { lowerCase: '.?12' } ] },
				{ width: 0.4, command: 'space', chars: [ { icon: 'space' } ] },
				{ width: 0.1, chars: [ { lowerCase: '?' } ] },
				{ width: 0.2, command: 'enter', chars: [ { icon: 'enter' } ] }
			]
		],

		[
			[
				{ width: 0.1, chars: [ { lowerCase: '1' } ] },
				{ width: 0.1, chars: [ { lowerCase: '2' } ] },
				{ width: 0.1, chars: [ { lowerCase: '3' } ] },
				{ width: 0.1, chars: [ { lowerCase: '4' } ] },
				{ width: 0.1, chars: [ { lowerCase: '5' } ] },
				{ width: 0.1, chars: [ { lowerCase: '6' } ] },
				{ width: 0.1, chars: [ { lowerCase: '7' } ] },
				{ width: 0.1, chars: [ { lowerCase: '8' } ] },
				{ width: 0.1, chars: [ { lowerCase: '9' } ] },
				{ width: 0.1, chars: [ { lowerCase: '0' } ] }
			],

			[
				{ width: 0.1, chars: [ { lowerCase: '@' } ] },
				{ width: 0.1, chars: [ { lowerCase: '#' } ] },
				{ width: 0.1, chars: [ { lowerCase: '|' } ] },
				{ width: 0.1, chars: [ { lowerCase: '_' } ] },
				{ width: 0.1, chars: [ { lowerCase: '&' } ] },
				{ width: 0.1, chars: [ { lowerCase: '-' } ] },
				{ width: 0.1, chars: [ { lowerCase: '+' } ] },
				{ width: 0.1, chars: [ { lowerCase: '(' } ] },
				{ width: 0.1, chars: [ { lowerCase: ')' } ] },
				{ width: 0.1, chars: [ { lowerCase: '/' } ] }
			],

			[
				{ width: 0.1, chars: [ { lowerCase: '=' } ] },
				{ width: 0.1, chars: [ { lowerCase: '*' } ] },
				{ width: 0.1, chars: [ { lowerCase: '"' } ] },
				{ width: 0.1, chars: [ { lowerCase: '\'' } ] },
				{ width: 0.1, chars: [ { lowerCase: ':' } ] },
				{ width: 0.1, chars: [ { lowerCase: ';' } ] },
				{ width: 0.1, chars: [ { lowerCase: '!' } ] },
				{ width: 0.1, chars: [ { lowerCase: '?' } ] },
				{ width: 0.2, command: 'backspace', chars: [ { icon: 'backspace' } ] }
			],

			[
				{ width: 0.2, command: 'switch', chars: [ { lowerCase: '.?12' } ] },
				{ width: 0.1, chars: [ { lowerCase: ',' } ] },
				{ width: 0.4, command: 'space', chars: [ { icon: 'space' } ] },
				{ width: 0.1, chars: [ { lowerCase: '.' } ] },
				{ width: 0.2, command: 'enter', chars: [ { icon: 'enter' } ] }
			]
		]
	],

	// north
	nord:[
		[
			[
				{ width: 1 / 11, chars: [ { lowerCase: 'q', upperCase: 'Q' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'w', upperCase: 'W' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'e', upperCase: 'E' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'r', upperCase: 'R' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 't', upperCase: 'T' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'y', upperCase: 'Y' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'u', upperCase: 'U' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'i', upperCase: 'I' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'o', upperCase: 'O' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'p', upperCase: 'P' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: '??', upperCase: '??' } ] }
			],

			[
				{ width: 1 / 11, chars: [ { lowerCase: 'a', upperCase: 'A' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 's', upperCase: 'S' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'd', upperCase: 'D' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'f', upperCase: 'F' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'g', upperCase: 'G' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'h', upperCase: 'H' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'j', upperCase: 'J' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'k', upperCase: 'K' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'l', upperCase: 'L' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: '??', upperCase: '??' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: '??', upperCase: '??' } ] }
			],

			[
				{ width: 2 / 11, command: 'shift', chars: [ { icon: 'shift' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'z', upperCase: 'Z' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'x', upperCase: 'X' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'c', upperCase: 'C' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'v', upperCase: 'V' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'b', upperCase: 'B' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'n', upperCase: 'N' } ] },
				{ width: 1 / 11, chars: [ { lowerCase: 'm', upperCase: 'M' } ] },
				{ width: 2 / 11, command: 'backspace', chars: [ { icon: 'backspace' } ] }
			],

			[
				{ width: 0.2, command: 'switch', chars: [ { lowerCase: '.?12' } ] },
				{ width: 0.1, chars: [ { lowerCase: ',' } ] },
				{ width: 0.4, command: 'space', chars: [ { icon: 'space' } ] },
				{ width: 0.1, chars: [ { lowerCase: '.' } ] },
				{ width: 0.2, command: 'enter', chars: [ { icon: 'enter' } ] }
			]

		],

		[
			[
				{ width: 0.1, chars: [ { lowerCase: '1' } ] },
				{ width: 0.1, chars: [ { lowerCase: '2' } ] },
				{ width: 0.1, chars: [ { lowerCase: '3' } ] },
				{ width: 0.1, chars: [ { lowerCase: '4' } ] },
				{ width: 0.1, chars: [ { lowerCase: '5' } ] },
				{ width: 0.1, chars: [ { lowerCase: '6' } ] },
				{ width: 0.1, chars: [ { lowerCase: '7' } ] },
				{ width: 0.1, chars: [ { lowerCase: '8' } ] },
				{ width: 0.1, chars: [ { lowerCase: '9' } ] },
				{ width: 0.1, chars: [ { lowerCase: '0' } ] }
			],

			[
				{ width: 0.1, chars: [ { lowerCase: '@' } ] },
				{ width: 0.1, chars: [ { lowerCase: '#' } ] },
				{ width: 0.1, chars: [ { lowerCase: '|' } ] },
				{ width: 0.1, chars: [ { lowerCase: '_' } ] },
				{ width: 0.1, chars: [ { lowerCase: '&' } ] },
				{ width: 0.1, chars: [ { lowerCase: '-' } ] },
				{ width: 0.1, chars: [ { lowerCase: '+' } ] },
				{ width: 0.1, chars: [ { lowerCase: '(' } ] },
				{ width: 0.1, chars: [ { lowerCase: ')' } ] },
				{ width: 0.1, chars: [ { lowerCase: '/' } ] }
			],

			[
				{ width: 0.1, chars: [ { lowerCase: '=' } ] },
				{ width: 0.1, chars: [ { lowerCase: '*' } ] },
				{ width: 0.1, chars: [ { lowerCase: '"' } ] },
				{ width: 0.1, chars: [ { lowerCase: '\'' } ] },
				{ width: 0.1, chars: [ { lowerCase: ':' } ] },
				{ width: 0.1, chars: [ { lowerCase: ';' } ] },
				{ width: 0.1, chars: [ { lowerCase: '!' } ] },
				{ width: 0.1, chars: [ { lowerCase: '?' } ] },
				{ width: 0.2, command: 'backspace', chars: [ { icon: 'backspace' } ] }
			],

			[
				{ width: 0.2, command: 'switch', chars: [ { lowerCase: '.?12' } ] },
				{ width: 0.1, chars: [ { lowerCase: ',' } ] },
				{ width: 0.4, command: 'space', chars: [ { icon: 'space' } ] },
				{ width: 0.1, chars: [ { lowerCase: '.' } ] },
				{ width: 0.2, command: 'enter', chars: [ { icon: 'enter' } ] }
			]
		]
	]
};

class Keymap {
	static get( lg ) {

		let keymap;

		if ( lg || navigator.language )
		{

			switch ( lg || navigator.language )
			{

			case 'fr':
			case 'fr-CH':
			case 'fr-CA':
				keymap = keymaps.fr;
				break;

			case 'ru':
				this.charsetCount = 2;
				keymap = keymaps.ru;
				break;

			case 'de':
			case 'de-DE':
			case 'de-AT':
			case 'de-LI':
			case 'de-CH':
				keymap = keymaps.de;
				break;

			case 'es':
			case 'es-419':
			case 'es-AR':
			case 'es-CL':
			case 'es-CO':
			case 'es-ES':
			case 'es-CR':
			case 'es-US':
			case 'es-HN':
			case 'es-MX':
			case 'es-PE':
			case 'es-UY':
			case 'es-VE':
				keymap = keymaps.es;
				break;

			case 'el':
				this.charsetCount = 2;
				keymap = keymaps.el;
				break;

			case 'nord':
				keymap = keymaps.nord;
				break;

			default:
				keymap = keymaps.eng;
				break;

			}

		} else
		{

			keymap = keymaps.eng;

		}

		return keymap;

	}
}

export { Keymap };
