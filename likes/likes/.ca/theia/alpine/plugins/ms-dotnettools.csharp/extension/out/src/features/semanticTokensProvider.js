"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const serverUtils = require("../omnisharp/utils");
const typeConversion_1 = require("../omnisharp/typeConversion");
const abstractProvider_1 = require("./abstractProvider");
// The default TokenTypes defined by VS Code https://github.com/microsoft/vscode/blob/master/src/vs/platform/theme/common/tokenClassificationRegistry.ts#L393
var DefaultTokenType;
(function (DefaultTokenType) {
    DefaultTokenType[DefaultTokenType["comment"] = 0] = "comment";
    DefaultTokenType[DefaultTokenType["string"] = 1] = "string";
    DefaultTokenType[DefaultTokenType["keyword"] = 2] = "keyword";
    DefaultTokenType[DefaultTokenType["number"] = 3] = "number";
    DefaultTokenType[DefaultTokenType["regexp"] = 4] = "regexp";
    DefaultTokenType[DefaultTokenType["operator"] = 5] = "operator";
    DefaultTokenType[DefaultTokenType["namespace"] = 6] = "namespace";
    DefaultTokenType[DefaultTokenType["type"] = 7] = "type";
    DefaultTokenType[DefaultTokenType["struct"] = 8] = "struct";
    DefaultTokenType[DefaultTokenType["class"] = 9] = "class";
    DefaultTokenType[DefaultTokenType["interface"] = 10] = "interface";
    DefaultTokenType[DefaultTokenType["enum"] = 11] = "enum";
    DefaultTokenType[DefaultTokenType["typeParameter"] = 12] = "typeParameter";
    DefaultTokenType[DefaultTokenType["function"] = 13] = "function";
    DefaultTokenType[DefaultTokenType["member"] = 14] = "member";
    DefaultTokenType[DefaultTokenType["macro"] = 15] = "macro";
    DefaultTokenType[DefaultTokenType["variable"] = 16] = "variable";
    DefaultTokenType[DefaultTokenType["parameter"] = 17] = "parameter";
    DefaultTokenType[DefaultTokenType["property"] = 18] = "property";
    DefaultTokenType[DefaultTokenType["enumMember"] = 19] = "enumMember";
    DefaultTokenType[DefaultTokenType["event"] = 20] = "event";
    DefaultTokenType[DefaultTokenType["label"] = 21] = "label";
})(DefaultTokenType || (DefaultTokenType = {}));
var CustomTokenType;
(function (CustomTokenType) {
    CustomTokenType[CustomTokenType["plainKeyword"] = 22] = "plainKeyword";
    CustomTokenType[CustomTokenType["controlKeyword"] = 23] = "controlKeyword";
    CustomTokenType[CustomTokenType["operatorOverloaded"] = 24] = "operatorOverloaded";
    CustomTokenType[CustomTokenType["preprocessorKeyword"] = 25] = "preprocessorKeyword";
    CustomTokenType[CustomTokenType["preprocessorText"] = 26] = "preprocessorText";
    CustomTokenType[CustomTokenType["excludedCode"] = 27] = "excludedCode";
    CustomTokenType[CustomTokenType["punctuation"] = 28] = "punctuation";
    CustomTokenType[CustomTokenType["stringVerbatim"] = 29] = "stringVerbatim";
    CustomTokenType[CustomTokenType["stringEscapeCharacter"] = 30] = "stringEscapeCharacter";
    CustomTokenType[CustomTokenType["delegate"] = 31] = "delegate";
    CustomTokenType[CustomTokenType["module"] = 32] = "module";
    CustomTokenType[CustomTokenType["extensionMethod"] = 33] = "extensionMethod";
    CustomTokenType[CustomTokenType["field"] = 34] = "field";
    CustomTokenType[CustomTokenType["local"] = 35] = "local";
    CustomTokenType[CustomTokenType["xmlDocCommentAttributeName"] = 36] = "xmlDocCommentAttributeName";
    CustomTokenType[CustomTokenType["xmlDocCommentAttributeQuotes"] = 37] = "xmlDocCommentAttributeQuotes";
    CustomTokenType[CustomTokenType["xmlDocCommentAttributeValue"] = 38] = "xmlDocCommentAttributeValue";
    CustomTokenType[CustomTokenType["xmlDocCommentCDataSection"] = 39] = "xmlDocCommentCDataSection";
    CustomTokenType[CustomTokenType["xmlDocCommentComment"] = 40] = "xmlDocCommentComment";
    CustomTokenType[CustomTokenType["xmlDocCommentDelimiter"] = 41] = "xmlDocCommentDelimiter";
    CustomTokenType[CustomTokenType["xmlDocCommentEntityReference"] = 42] = "xmlDocCommentEntityReference";
    CustomTokenType[CustomTokenType["xmlDocCommentName"] = 43] = "xmlDocCommentName";
    CustomTokenType[CustomTokenType["xmlDocCommentProcessingInstruction"] = 44] = "xmlDocCommentProcessingInstruction";
    CustomTokenType[CustomTokenType["xmlDocCommentText"] = 45] = "xmlDocCommentText";
})(CustomTokenType || (CustomTokenType = {}));
// The default TokenModifiers defined by VS Code https://github.com/microsoft/vscode/blob/master/src/vs/platform/theme/common/tokenClassificationRegistry.ts#L393
var DefaultTokenModifier;
(function (DefaultTokenModifier) {
    DefaultTokenModifier[DefaultTokenModifier["declaration"] = 0] = "declaration";
    DefaultTokenModifier[DefaultTokenModifier["static"] = 1] = "static";
    DefaultTokenModifier[DefaultTokenModifier["abstract"] = 2] = "abstract";
    DefaultTokenModifier[DefaultTokenModifier["deprecated"] = 3] = "deprecated";
    DefaultTokenModifier[DefaultTokenModifier["modification"] = 4] = "modification";
    DefaultTokenModifier[DefaultTokenModifier["async"] = 5] = "async";
    DefaultTokenModifier[DefaultTokenModifier["readonly"] = 6] = "readonly";
})(DefaultTokenModifier || (DefaultTokenModifier = {}));
// All classifications from Roslyn's ClassificationTypeNames https://github.com/dotnet/roslyn/blob/master/src/Workspaces/Core/Portable/Classification/ClassificationTypeNames.cs
// Keep in sync with omnisharp-roslyn's SemanticHighlightClassification
var SemanticHighlightClassification;
(function (SemanticHighlightClassification) {
    SemanticHighlightClassification[SemanticHighlightClassification["Comment"] = 0] = "Comment";
    SemanticHighlightClassification[SemanticHighlightClassification["ExcludedCode"] = 1] = "ExcludedCode";
    SemanticHighlightClassification[SemanticHighlightClassification["Identifier"] = 2] = "Identifier";
    SemanticHighlightClassification[SemanticHighlightClassification["Keyword"] = 3] = "Keyword";
    SemanticHighlightClassification[SemanticHighlightClassification["ControlKeyword"] = 4] = "ControlKeyword";
    SemanticHighlightClassification[SemanticHighlightClassification["NumericLiteral"] = 5] = "NumericLiteral";
    SemanticHighlightClassification[SemanticHighlightClassification["Operator"] = 6] = "Operator";
    SemanticHighlightClassification[SemanticHighlightClassification["OperatorOverloaded"] = 7] = "OperatorOverloaded";
    SemanticHighlightClassification[SemanticHighlightClassification["PreprocessorKeyword"] = 8] = "PreprocessorKeyword";
    SemanticHighlightClassification[SemanticHighlightClassification["StringLiteral"] = 9] = "StringLiteral";
    SemanticHighlightClassification[SemanticHighlightClassification["WhiteSpace"] = 10] = "WhiteSpace";
    SemanticHighlightClassification[SemanticHighlightClassification["Text"] = 11] = "Text";
    SemanticHighlightClassification[SemanticHighlightClassification["StaticSymbol"] = 12] = "StaticSymbol";
    SemanticHighlightClassification[SemanticHighlightClassification["PreprocessorText"] = 13] = "PreprocessorText";
    SemanticHighlightClassification[SemanticHighlightClassification["Punctuation"] = 14] = "Punctuation";
    SemanticHighlightClassification[SemanticHighlightClassification["VerbatimStringLiteral"] = 15] = "VerbatimStringLiteral";
    SemanticHighlightClassification[SemanticHighlightClassification["StringEscapeCharacter"] = 16] = "StringEscapeCharacter";
    SemanticHighlightClassification[SemanticHighlightClassification["ClassName"] = 17] = "ClassName";
    SemanticHighlightClassification[SemanticHighlightClassification["DelegateName"] = 18] = "DelegateName";
    SemanticHighlightClassification[SemanticHighlightClassification["EnumName"] = 19] = "EnumName";
    SemanticHighlightClassification[SemanticHighlightClassification["InterfaceName"] = 20] = "InterfaceName";
    SemanticHighlightClassification[SemanticHighlightClassification["ModuleName"] = 21] = "ModuleName";
    SemanticHighlightClassification[SemanticHighlightClassification["StructName"] = 22] = "StructName";
    SemanticHighlightClassification[SemanticHighlightClassification["TypeParameterName"] = 23] = "TypeParameterName";
    SemanticHighlightClassification[SemanticHighlightClassification["FieldName"] = 24] = "FieldName";
    SemanticHighlightClassification[SemanticHighlightClassification["EnumMemberName"] = 25] = "EnumMemberName";
    SemanticHighlightClassification[SemanticHighlightClassification["ConstantName"] = 26] = "ConstantName";
    SemanticHighlightClassification[SemanticHighlightClassification["LocalName"] = 27] = "LocalName";
    SemanticHighlightClassification[SemanticHighlightClassification["ParameterName"] = 28] = "ParameterName";
    SemanticHighlightClassification[SemanticHighlightClassification["MethodName"] = 29] = "MethodName";
    SemanticHighlightClassification[SemanticHighlightClassification["ExtensionMethodName"] = 30] = "ExtensionMethodName";
    SemanticHighlightClassification[SemanticHighlightClassification["PropertyName"] = 31] = "PropertyName";
    SemanticHighlightClassification[SemanticHighlightClassification["EventName"] = 32] = "EventName";
    SemanticHighlightClassification[SemanticHighlightClassification["NamespaceName"] = 33] = "NamespaceName";
    SemanticHighlightClassification[SemanticHighlightClassification["LabelName"] = 34] = "LabelName";
    SemanticHighlightClassification[SemanticHighlightClassification["XmlDocCommentAttributeName"] = 35] = "XmlDocCommentAttributeName";
    SemanticHighlightClassification[SemanticHighlightClassification["XmlDocCommentAttributeQuotes"] = 36] = "XmlDocCommentAttributeQuotes";
    SemanticHighlightClassification[SemanticHighlightClassification["XmlDocCommentAttributeValue"] = 37] = "XmlDocCommentAttributeValue";
    SemanticHighlightClassification[SemanticHighlightClassification["XmlDocCommentCDataSection"] = 38] = "XmlDocCommentCDataSection";
    SemanticHighlightClassification[SemanticHighlightClassification["XmlDocCommentComment"] = 39] = "XmlDocCommentComment";
    SemanticHighlightClassification[SemanticHighlightClassification["XmlDocCommentDelimiter"] = 40] = "XmlDocCommentDelimiter";
    SemanticHighlightClassification[SemanticHighlightClassification["XmlDocCommentEntityReference"] = 41] = "XmlDocCommentEntityReference";
    SemanticHighlightClassification[SemanticHighlightClassification["XmlDocCommentName"] = 42] = "XmlDocCommentName";
    SemanticHighlightClassification[SemanticHighlightClassification["XmlDocCommentProcessingInstruction"] = 43] = "XmlDocCommentProcessingInstruction";
    SemanticHighlightClassification[SemanticHighlightClassification["XmlDocCommentText"] = 44] = "XmlDocCommentText";
    SemanticHighlightClassification[SemanticHighlightClassification["XmlLiteralAttributeName"] = 45] = "XmlLiteralAttributeName";
    SemanticHighlightClassification[SemanticHighlightClassification["XmlLiteralAttributeQuotes"] = 46] = "XmlLiteralAttributeQuotes";
    SemanticHighlightClassification[SemanticHighlightClassification["XmlLiteralAttributeValue"] = 47] = "XmlLiteralAttributeValue";
    SemanticHighlightClassification[SemanticHighlightClassification["XmlLiteralCDataSection"] = 48] = "XmlLiteralCDataSection";
    SemanticHighlightClassification[SemanticHighlightClassification["XmlLiteralComment"] = 49] = "XmlLiteralComment";
    SemanticHighlightClassification[SemanticHighlightClassification["XmlLiteralDelimiter"] = 50] = "XmlLiteralDelimiter";
    SemanticHighlightClassification[SemanticHighlightClassification["XmlLiteralEmbeddedExpression"] = 51] = "XmlLiteralEmbeddedExpression";
    SemanticHighlightClassification[SemanticHighlightClassification["XmlLiteralEntityReference"] = 52] = "XmlLiteralEntityReference";
    SemanticHighlightClassification[SemanticHighlightClassification["XmlLiteralName"] = 53] = "XmlLiteralName";
    SemanticHighlightClassification[SemanticHighlightClassification["XmlLiteralProcessingInstruction"] = 54] = "XmlLiteralProcessingInstruction";
    SemanticHighlightClassification[SemanticHighlightClassification["XmlLiteralText"] = 55] = "XmlLiteralText";
    SemanticHighlightClassification[SemanticHighlightClassification["RegexComment"] = 56] = "RegexComment";
    SemanticHighlightClassification[SemanticHighlightClassification["RegexCharacterClass"] = 57] = "RegexCharacterClass";
    SemanticHighlightClassification[SemanticHighlightClassification["RegexAnchor"] = 58] = "RegexAnchor";
    SemanticHighlightClassification[SemanticHighlightClassification["RegexQuantifier"] = 59] = "RegexQuantifier";
    SemanticHighlightClassification[SemanticHighlightClassification["RegexGrouping"] = 60] = "RegexGrouping";
    SemanticHighlightClassification[SemanticHighlightClassification["RegexAlternation"] = 61] = "RegexAlternation";
    SemanticHighlightClassification[SemanticHighlightClassification["RegexText"] = 62] = "RegexText";
    SemanticHighlightClassification[SemanticHighlightClassification["RegexSelfEscapedCharacter"] = 63] = "RegexSelfEscapedCharacter";
    SemanticHighlightClassification[SemanticHighlightClassification["RegexOtherEscape"] = 64] = "RegexOtherEscape";
})(SemanticHighlightClassification || (SemanticHighlightClassification = {}));
var SemanticHighlightModifier;
(function (SemanticHighlightModifier) {
    SemanticHighlightModifier[SemanticHighlightModifier["Static"] = 0] = "Static";
})(SemanticHighlightModifier || (SemanticHighlightModifier = {}));
class SemanticTokensProvider extends abstractProvider_1.default {
    constructor(server, optionProvider, languageMiddlewareFeature) {
        super(server, languageMiddlewareFeature);
        this.optionProvider = optionProvider;
    }
    getLegend() {
        return new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers);
    }
    provideDocumentSemanticTokens(document, token) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._provideSemanticTokens(document, null, token);
        });
    }
    provideDocumentRangeSemanticTokens(document, range, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const v2Range = {
                Start: {
                    Line: range.start.line,
                    Column: range.start.character
                },
                End: {
                    Line: range.end.line,
                    Column: range.end.character
                }
            };
            return this._provideSemanticTokens(document, v2Range, token);
        });
    }
    _provideSemanticTokens(document, range, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = this.optionProvider.GetLatestOptions();
            if (!options.useSemanticHighlighting) {
                return null;
            }
            let req = typeConversion_1.createRequest(document, new vscode.Position(0, 0));
            req.Range = range;
            const versionBeforeRequest = document.version;
            const response = yield serverUtils.getSemanticHighlights(this._server, req);
            const versionAfterRequest = document.version;
            if (versionBeforeRequest !== versionAfterRequest) {
                // cannot convert result's offsets to (line;col) values correctly
                // a new request will come in soon...
                //
                // here we cannot return null, because returning null would remove all semantic tokens.
                // we must throw to indicate that the semantic tokens should not be removed.
                // using the string busy here because it is not logged to error telemetry if the error text contains busy.
                throw new Error('busy');
            }
            const builder = new vscode.SemanticTokensBuilder();
            for (let span of response.Spans) {
                const tokenType = tokenTypeMap[span.Type];
                if (tokenType === undefined) {
                    continue;
                }
                let tokenModifiers = span.Modifiers.reduce((modifiers, modifier) => modifiers + tokenModifierMap[modifier], 0);
                // We could add a separate classification for constants but they are
                // supported as a readonly variable. Until we start getting more complete
                // modifiers from the highlight service we can add the readonly modifier here.
                if (span.Type === SemanticHighlightClassification.ConstantName) {
                    tokenModifiers += Math.pow(2, DefaultTokenModifier.readonly);
                }
                // We can use the returned range because we made sure the document version is the same.
                let spanRange = typeConversion_1.toRange2(span);
                for (let line = spanRange.start.line; line <= spanRange.end.line; line++) {
                    const startCharacter = (line === spanRange.start.line ? spanRange.start.character : 0);
                    const endCharacter = (line === spanRange.end.line ? spanRange.end.character : document.lineAt(line).text.length);
                    builder.push(line, startCharacter, endCharacter - startCharacter, tokenType, tokenModifiers);
                }
            }
            return builder.build();
        });
    }
}
exports.default = SemanticTokensProvider;
const tokenTypes = [];
tokenTypes[DefaultTokenType.comment] = vscode_languageserver_protocol_1.SemanticTokenTypes.comment;
tokenTypes[DefaultTokenType.string] = vscode_languageserver_protocol_1.SemanticTokenTypes.string;
tokenTypes[DefaultTokenType.keyword] = vscode_languageserver_protocol_1.SemanticTokenTypes.keyword;
tokenTypes[DefaultTokenType.number] = vscode_languageserver_protocol_1.SemanticTokenTypes.number;
tokenTypes[DefaultTokenType.regexp] = vscode_languageserver_protocol_1.SemanticTokenTypes.regexp;
tokenTypes[DefaultTokenType.operator] = vscode_languageserver_protocol_1.SemanticTokenTypes.operator;
tokenTypes[DefaultTokenType.namespace] = vscode_languageserver_protocol_1.SemanticTokenTypes.namespace;
tokenTypes[DefaultTokenType.type] = vscode_languageserver_protocol_1.SemanticTokenTypes.type;
tokenTypes[DefaultTokenType.struct] = vscode_languageserver_protocol_1.SemanticTokenTypes.struct;
tokenTypes[DefaultTokenType.class] = vscode_languageserver_protocol_1.SemanticTokenTypes.class;
tokenTypes[DefaultTokenType.interface] = vscode_languageserver_protocol_1.SemanticTokenTypes.interface;
tokenTypes[DefaultTokenType.enum] = vscode_languageserver_protocol_1.SemanticTokenTypes.enum;
tokenTypes[DefaultTokenType.typeParameter] = vscode_languageserver_protocol_1.SemanticTokenTypes.typeParameter;
tokenTypes[DefaultTokenType.function] = vscode_languageserver_protocol_1.SemanticTokenTypes.function;
tokenTypes[DefaultTokenType.member] = 'member';
tokenTypes[DefaultTokenType.macro] = vscode_languageserver_protocol_1.SemanticTokenTypes.macro;
tokenTypes[DefaultTokenType.variable] = vscode_languageserver_protocol_1.SemanticTokenTypes.variable;
tokenTypes[DefaultTokenType.parameter] = vscode_languageserver_protocol_1.SemanticTokenTypes.parameter;
tokenTypes[DefaultTokenType.property] = vscode_languageserver_protocol_1.SemanticTokenTypes.property;
tokenTypes[DefaultTokenType.enumMember] = 'enumMember';
tokenTypes[DefaultTokenType.event] = 'event';
tokenTypes[DefaultTokenType.label] = 'label';
tokenTypes[CustomTokenType.plainKeyword] = "plainKeyword";
tokenTypes[CustomTokenType.controlKeyword] = "controlKeyword";
tokenTypes[CustomTokenType.operatorOverloaded] = "operatorOverloaded";
tokenTypes[CustomTokenType.preprocessorKeyword] = "preprocessorKeyword";
tokenTypes[CustomTokenType.preprocessorText] = "preprocessorText";
tokenTypes[CustomTokenType.excludedCode] = "excludedCode";
tokenTypes[CustomTokenType.punctuation] = "punctuation";
tokenTypes[CustomTokenType.stringVerbatim] = "stringVerbatim";
tokenTypes[CustomTokenType.stringEscapeCharacter] = "stringEscapeCharacter";
tokenTypes[CustomTokenType.delegate] = "delegate";
tokenTypes[CustomTokenType.module] = "module";
tokenTypes[CustomTokenType.extensionMethod] = "extensionMethod";
tokenTypes[CustomTokenType.field] = "field";
tokenTypes[CustomTokenType.local] = "local";
tokenTypes[CustomTokenType.xmlDocCommentAttributeName] = "xmlDocCommentAttributeName";
tokenTypes[CustomTokenType.xmlDocCommentAttributeQuotes] = "xmlDocCommentAttributeQuotes";
tokenTypes[CustomTokenType.xmlDocCommentAttributeValue] = "xmlDocCommentAttributeValue";
tokenTypes[CustomTokenType.xmlDocCommentCDataSection] = "xmlDocCommentCDataSection";
tokenTypes[CustomTokenType.xmlDocCommentComment] = "xmlDocCommentComment";
tokenTypes[CustomTokenType.xmlDocCommentDelimiter] = "xmlDocCommentDelimiter";
tokenTypes[CustomTokenType.xmlDocCommentEntityReference] = "xmlDocCommentEntityReference";
tokenTypes[CustomTokenType.xmlDocCommentName] = "xmlDocCommentName";
tokenTypes[CustomTokenType.xmlDocCommentProcessingInstruction] = "xmlDocCommentProcessingInstruction";
tokenTypes[CustomTokenType.xmlDocCommentText] = "xmlDocCommentText";
const tokenModifiers = [];
tokenModifiers[DefaultTokenModifier.declaration] = 'declaration';
tokenModifiers[DefaultTokenModifier.static] = 'static';
tokenModifiers[DefaultTokenModifier.abstract] = 'abstract';
tokenModifiers[DefaultTokenModifier.deprecated] = 'deprecated';
tokenModifiers[DefaultTokenModifier.modification] = 'modification';
tokenModifiers[DefaultTokenModifier.async] = 'async';
tokenModifiers[DefaultTokenModifier.readonly] = 'readonly';
const tokenTypeMap = [];
tokenTypeMap[SemanticHighlightClassification.Comment] = DefaultTokenType.comment;
tokenTypeMap[SemanticHighlightClassification.ExcludedCode] = CustomTokenType.excludedCode;
tokenTypeMap[SemanticHighlightClassification.Identifier] = DefaultTokenType.variable;
tokenTypeMap[SemanticHighlightClassification.Keyword] = CustomTokenType.plainKeyword;
tokenTypeMap[SemanticHighlightClassification.ControlKeyword] = CustomTokenType.controlKeyword;
tokenTypeMap[SemanticHighlightClassification.NumericLiteral] = DefaultTokenType.number;
tokenTypeMap[SemanticHighlightClassification.Operator] = DefaultTokenType.operator;
tokenTypeMap[SemanticHighlightClassification.OperatorOverloaded] = CustomTokenType.operatorOverloaded;
tokenTypeMap[SemanticHighlightClassification.PreprocessorKeyword] = CustomTokenType.preprocessorKeyword;
tokenTypeMap[SemanticHighlightClassification.StringLiteral] = DefaultTokenType.string;
tokenTypeMap[SemanticHighlightClassification.WhiteSpace] = undefined;
tokenTypeMap[SemanticHighlightClassification.Text] = undefined;
tokenTypeMap[SemanticHighlightClassification.StaticSymbol] = undefined;
tokenTypeMap[SemanticHighlightClassification.PreprocessorText] = CustomTokenType.preprocessorText;
tokenTypeMap[SemanticHighlightClassification.Punctuation] = CustomTokenType.punctuation;
tokenTypeMap[SemanticHighlightClassification.VerbatimStringLiteral] = CustomTokenType.stringVerbatim;
tokenTypeMap[SemanticHighlightClassification.StringEscapeCharacter] = CustomTokenType.stringEscapeCharacter;
tokenTypeMap[SemanticHighlightClassification.ClassName] = DefaultTokenType.class;
tokenTypeMap[SemanticHighlightClassification.DelegateName] = CustomTokenType.delegate;
tokenTypeMap[SemanticHighlightClassification.EnumName] = DefaultTokenType.enum;
tokenTypeMap[SemanticHighlightClassification.InterfaceName] = DefaultTokenType.interface;
tokenTypeMap[SemanticHighlightClassification.ModuleName] = CustomTokenType.module;
tokenTypeMap[SemanticHighlightClassification.StructName] = DefaultTokenType.struct;
tokenTypeMap[SemanticHighlightClassification.TypeParameterName] = DefaultTokenType.typeParameter;
tokenTypeMap[SemanticHighlightClassification.FieldName] = CustomTokenType.field;
tokenTypeMap[SemanticHighlightClassification.EnumMemberName] = DefaultTokenType.enumMember;
tokenTypeMap[SemanticHighlightClassification.ConstantName] = DefaultTokenType.variable;
tokenTypeMap[SemanticHighlightClassification.LocalName] = CustomTokenType.local;
tokenTypeMap[SemanticHighlightClassification.ParameterName] = DefaultTokenType.parameter;
tokenTypeMap[SemanticHighlightClassification.MethodName] = DefaultTokenType.member;
tokenTypeMap[SemanticHighlightClassification.ExtensionMethodName] = CustomTokenType.extensionMethod;
tokenTypeMap[SemanticHighlightClassification.PropertyName] = DefaultTokenType.property;
tokenTypeMap[SemanticHighlightClassification.EventName] = DefaultTokenType.event;
tokenTypeMap[SemanticHighlightClassification.NamespaceName] = DefaultTokenType.namespace;
tokenTypeMap[SemanticHighlightClassification.LabelName] = DefaultTokenType.label;
tokenTypeMap[SemanticHighlightClassification.XmlDocCommentAttributeName] = CustomTokenType.xmlDocCommentAttributeName;
tokenTypeMap[SemanticHighlightClassification.XmlDocCommentAttributeQuotes] = CustomTokenType.xmlDocCommentAttributeQuotes;
tokenTypeMap[SemanticHighlightClassification.XmlDocCommentAttributeValue] = CustomTokenType.xmlDocCommentAttributeValue;
tokenTypeMap[SemanticHighlightClassification.XmlDocCommentCDataSection] = CustomTokenType.xmlDocCommentCDataSection;
tokenTypeMap[SemanticHighlightClassification.XmlDocCommentComment] = CustomTokenType.xmlDocCommentComment;
tokenTypeMap[SemanticHighlightClassification.XmlDocCommentDelimiter] = CustomTokenType.xmlDocCommentDelimiter;
tokenTypeMap[SemanticHighlightClassification.XmlDocCommentEntityReference] = CustomTokenType.xmlDocCommentEntityReference;
tokenTypeMap[SemanticHighlightClassification.XmlDocCommentName] = CustomTokenType.xmlDocCommentName;
tokenTypeMap[SemanticHighlightClassification.XmlDocCommentProcessingInstruction] = CustomTokenType.xmlDocCommentProcessingInstruction;
tokenTypeMap[SemanticHighlightClassification.XmlDocCommentText] = CustomTokenType.xmlDocCommentText;
tokenTypeMap[SemanticHighlightClassification.XmlLiteralAttributeName] = undefined;
tokenTypeMap[SemanticHighlightClassification.XmlLiteralAttributeQuotes] = undefined;
tokenTypeMap[SemanticHighlightClassification.XmlLiteralAttributeValue] = undefined;
tokenTypeMap[SemanticHighlightClassification.XmlLiteralCDataSection] = undefined;
tokenTypeMap[SemanticHighlightClassification.XmlLiteralComment] = undefined;
tokenTypeMap[SemanticHighlightClassification.XmlLiteralDelimiter] = undefined;
tokenTypeMap[SemanticHighlightClassification.XmlLiteralEmbeddedExpression] = undefined;
tokenTypeMap[SemanticHighlightClassification.XmlLiteralEntityReference] = undefined;
tokenTypeMap[SemanticHighlightClassification.XmlLiteralName] = undefined;
tokenTypeMap[SemanticHighlightClassification.XmlLiteralProcessingInstruction] = undefined;
tokenTypeMap[SemanticHighlightClassification.XmlLiteralText] = undefined;
tokenTypeMap[SemanticHighlightClassification.RegexComment] = DefaultTokenType.regexp;
tokenTypeMap[SemanticHighlightClassification.RegexCharacterClass] = DefaultTokenType.regexp;
tokenTypeMap[SemanticHighlightClassification.RegexAnchor] = DefaultTokenType.regexp;
tokenTypeMap[SemanticHighlightClassification.RegexQuantifier] = DefaultTokenType.regexp;
tokenTypeMap[SemanticHighlightClassification.RegexGrouping] = DefaultTokenType.regexp;
tokenTypeMap[SemanticHighlightClassification.RegexAlternation] = DefaultTokenType.regexp;
tokenTypeMap[SemanticHighlightClassification.RegexText] = DefaultTokenType.regexp;
tokenTypeMap[SemanticHighlightClassification.RegexSelfEscapedCharacter] = DefaultTokenType.regexp;
tokenTypeMap[SemanticHighlightClassification.RegexOtherEscape] = DefaultTokenType.regexp;
const tokenModifierMap = [];
tokenModifierMap[SemanticHighlightModifier.Static] = Math.pow(2, DefaultTokenModifier.static);
//# sourceMappingURL=semanticTokensProvider.js.map