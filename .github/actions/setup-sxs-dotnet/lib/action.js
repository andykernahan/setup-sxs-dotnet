"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const installer = __importStar(require("setup-dotnet/lib/installer.js"));
// The destination path in which we create the side by side dotnet installation.
const SXS_DOTNET_PATH = path.join(process.env['HOME'] || '', 'sxs-dotnet');
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const dotnetVersions = getDotnetVersions();
            yield installSxsDotnet(dotnetVersions);
            exportSxsDotnet();
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
function getDotnetVersions() {
    const input = core.getInput('dotnet-versions', { required: true });
    const versions = input
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .sort();
    if (!versions.length) {
        throw 'No dotnet-versions were specified';
    }
    console.log('Installing', versions);
    return versions;
}
function installSxsDotnet(dotnetVersions) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const dotnetVersion of dotnetVersions) {
            const dotnetPath = yield installDotnet(dotnetVersion);
            console.log('Copying %s to %s', dotnetPath, SXS_DOTNET_PATH);
            yield fs.copy(dotnetPath, SXS_DOTNET_PATH);
        }
    });
}
function installDotnet(version) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Installing', version);
        const dotnetInstaller = new installer.DotnetCoreInstaller(version);
        yield dotnetInstaller.installDotnet();
        return process.env['DOTNET_ROOT'];
    });
}
function exportSxsDotnet() {
    core.exportVariable('DOTNET_ROOT', SXS_DOTNET_PATH);
    core.exportVariable('DOTNET_CLI_TELEMETRY_OPTOUT', '1');
    core.exportVariable('DOTNET_SKIP_FIRST_RUN_EXPERIENCE', 'true');
    core.addPath(SXS_DOTNET_PATH);
}
run();
