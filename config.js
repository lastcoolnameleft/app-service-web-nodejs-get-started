function config () {
    let classes = {
        'wizard': {},
        'rogue': {},
        'warrior': {},
    };

    let races = {
        'human': {
            'modifier': {},
            'size': 'medium',
            'speed': 20,
            'trait': ['low-light-vision']
        },
        'elf': {
            'modifier': {
                'init': 1,
                'dex': 2,
                'con': -2
            },
            'size': 'medium',
            'speed': 30,
            'trait': ['low-light-vision']
        },
        'dwarf': {
            'modifier': {
                'init': 0,
                'con': 2,
                'cha': -2
            },
            'size': 'medium',
            'speed': 20,
            'trait': ['low-light-vision']
        }
    }
}

module.exports = config;