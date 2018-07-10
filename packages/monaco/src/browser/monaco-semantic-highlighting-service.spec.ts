/********************************************************************************
 * Copyright (C) 2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import Uri from 'vscode-uri';
import { expect } from 'chai';
import { Position, Range } from 'vscode-languageserver-types';
import ITextModel = monaco.editor.ITextModel;
import LanguageIdentifier = monaco.services.LanguageIdentifier;

const MonacoRange = require('esm')(module)('monaco-editor-core/esm/vs/editor/common/core/range').Range;
const TextModel: {
    createFromString(text: string, options?: ITextModelCreationOptions, languageIdentifier?: LanguageIdentifier, uri?: Uri): ITextModel
} = require('esm')(module)('monaco-editor-core/esm/vs/editor/common/model/textModel').TextModel;

enum DefaultEndOfLine {
    LF = 1,
    CRLF = 2
}

interface ITextModelCreationOptions {
    tabSize: number;
    insertSpaces: boolean;
    detectIndentation: boolean;
    trimAutoWhitespace: boolean;
    defaultEOL: DefaultEndOfLine;
    isForSimpleWidget: boolean;
    largeFileOptimizations: boolean;
}

describe('monaco-semantic-highlighting-service', () => {

    it('can create a model', () => {
        const model = TextModel.createFromString(`const a = 'foo';`);
        expect(model.getValue()).to.be.equal(`const a = 'foo';`);
    });

    it('can modify a model', () => {
        const model = TextModel.createFromString(`const a = 'foo';`);
        model.applyEdits([{
            range: new MonacoRange(0, 0, 0, 0),
            text: `/* comment */ `
        }]);
        expect(model.getValue()).to.be.equal(`/* comment */ const a = 'foo';`);
    });

    it('can add decorations', () => {
        const model = TextModel.createFromString(`0123456
dddxeee
6543210`);
        const ids_1 = decorate(model, [],
            Range.create(Position.create(1, 0), Position.create(1, 3))
        );
        const ids_2 = decorate(model, [],
            Range.create(Position.create(1, 4), Position.create(1, 7))
        );
        console.log(ids_1, ids_2);
        let decorations = model.getAllDecorations();
        expect(decorations.length).equal(2);
        decorations.map(d => model.getDecorationRange(d.id)).forEach(r => {
            console.log(model.getValueInRange(r));
        });
        const ids_3 = decorate(model, ids_2);
        console.log(ids_3);
        decorations = model.getAllDecorations();
        expect(decorations.length).equal(1);
        decorations.map(d => model.getDecorationRange(d.id)).forEach(r => {
            console.log(model.getValueInRange(r));
        });
        // expect(decorations.map(d => model.getDecorationRange(model.getValueInRange(d.range)).sort()).to.be.deep.equal(['ddd', 'eee']);
    });

});

function decorate(model: ITextModel, oldIds: string[] = [], ...ranges: Range[]): string[] {
    return model.deltaDecorations(oldIds, ranges.map(r => ({ options: {}, range: new MonacoRange(r.start.line + 1, r.start.character + 1, r.end.line + 1, r.end.character + 1) })));
}
