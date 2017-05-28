const {expect, assert} = require('chai');
const margs = require('./lib/index.js');

suite('Basic Option and Argument Parsing', () => {
    test('Argument parsing', (done) => {
        let testArgv = ['', 'dry', 'tshirt'];
        margs()
            .arg('item')
            .action((args) => {
                expect(args['item']).to.equal('tshirt');
                done();
            })
            .parse(testArgv);
    });

    test('Long option name parsing', (done) => {
        let testArgv = ['', 'dry', '--temp', 'high'];
        margs()
            .option('temp') 
            .action((args) => {
                expect(args['temp']).to.equal('high');
                done();
            })
            .parse(testArgv);
    });

    test('Short option name parsing', (done) => {
        let testArgv = ['', 'dry', '-t', 'high'];
        margs()
            .option('t', 'temp') 
            .action((args) => {
                expect(args['temp']).to.equal('high');
                expect(args['t']).to.equal('high');
                done();
            })
            .parse(testArgv);
    });

    test('Many short option names parsing', () => {
        let testArgv = ['', 'dry', '-st', 'high'];
        return margs()
            .option('t', 'temp') 
            .option('s', 'signal', {isFlag:true}) 
            .action((args) => {
                expect(args['signal']).to.equal(true);
                expect(args['s']).to.equal(true);
                expect(args['temp']).to.equal('high');
                expect(args['t']).to.equal('high');
            })
            .parse(testArgv);
    });

    test('Argument and Option parsing', (done) => {
        let testArgv = ['', 'dry', 'tshirt'];
        margs()
            .arg('item')
            .action((args) => {
                expect(args['item']).to.equal('tshirt');
                done();
            })
            .parse(testArgv);
    });

    test('Fail on missing argument', () => {
        let testArgv = ['', 'dry'];
        let result = margs()
            .arg('item')
            .action((args) => {
            })
            .parse(testArgv);
        return result.then(
            () => { assert(false, 'Command should generate error') }, 
            () => { assert(true) }
        );
    });

    test('Fail on missing option', () => {
        let testArgv = ['', 'dry'];
        let result = margs()
            .option('temp')
            .action((args) => {
            })
            .parse(testArgv);
        return result.then(
            () => { assert(false, 'Command should generate error') }, 
            () => { assert(true) }
        );
    });

    test('Fail on unrecognized option', () => {
        let testArgv = ['', 'dry', '--amount', 'alot'];
        let result = margs()
            .action((args) => {
            })
            .parse(testArgv);
        return result.then(
            () => { assert(false, 'Command should generate error') }, 
            () => { assert(true) }
        );
    });

    test('Fail on non-existent argument', () => {
        let testArgv = ['', 'dry', 'alot'];
        let result = margs()
            .action((args) => {
            })
            .parse(testArgv);
        return result.then(
            () => { assert(false, 'Command should generate error') }, 
            () => { assert(true) }
        );
    });
});


suite('Sub-command parsing', () => {
    test('Option parsing with arguments', (done) => {
        let testArgv = ['', 'washer', 'something', '--option1', 'test'];
        return margs()
            .arg('arg1')
            .option('option1')
            .action((args) => {
                expect(args['arg1']).to.equal('something');
                expect(args['option1']).to.equal('test');
                done();
            })
            .parse(testArgv);
    });

    test('Sub-command option parsing', (done) => {
        let testArgv = ['', 'washer', 'rinse', '--temp', 'cold'];
        let program = margs();
        program
            .command('rinse')
            .option('temp')
            .action((args) => {
                expect(args['temp']).to.equal('cold');
                done();
            });
        program.parse(testArgv);
    });

    test('Sub-command option parsing with arguments', (done) => {
        let testArgv = ['', 'washer', 'rinse', 'socks', '--temp', 'cold'];
        let program = margs();
        program
            .command('rinse')
            .arg('item')
            .option('temp')
            .action((args) => {
                expect(args['item']).to.equal('socks');
                expect(args['temp']).to.equal('cold');
                done();
            });
        program.parse(testArgv);
    });

});
