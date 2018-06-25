/*!--------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define("vs/code/node/cliProcessMain.nls.ko",{"vs/base/common/errorMessage":["{0}: {1}","알 수 없는 오류가 발생했습니다. 자세한 내용은 로그를 참조하세요.","시스템 오류가 발생했습니다({0}).","알 수 없는 오류가 발생했습니다. 자세한 내용은 로그를 참조하세요.","{0}(총 {1}개의 오류)","알 수 없는 오류가 발생했습니다. 자세한 내용은 로그를 참조하세요."],"vs/base/common/severity":["오류","경고","정보"],"vs/base/node/zip":["완료되지 않았습니다. {1}개 항목 중 {0}개를 찾았습니다.","zip 파일 내에 {0}이(가) 없습니다."],"vs/code/node/cliProcessMain":["'{0}' 확장을 찾을 수 없습니다.","'{0}' 확장이 설치되어 있지 않습니다.","게시자를 포함한 전체 확장 ID(예: {0})를 사용하세요.","확장 '{0}'이(가) 설치되었습니다!","'{0}' 확장 설치를 취소했습니다.","'{0}' 확장이 이미 설치되어 있습니다.","마켓플레이스에서 '{0}'을(를) 찾았습니다.","설치 중...","확장 '{0}' v{1}이(가) 성공적으로 설치되었습니다!","'{0}' 확장 설치를 취소했습니다.","{0} 제거 중...","'{0}' 확장이 성공적으로 제거되었습니다!"],"vs/platform/configuration/common/configurationRegistry":["기본 구성 재정의","{0} 언어에 대해 재정의할 편집기 설정을 구성합니다.","언어에 대해 재정의할 편집기 설정을 구성합니다.","'{0}'을(를) 등록할 수 없습니다. 이는 언어별 편집기 설정을 설명하는 속성 패턴인 '\\\\[.*\\\\]$'과(와) 일치합니다. 'configurationDefaults' 기여를 사용하세요.","'{0}'을(를) 등록할 수 없습니다. 이 속성은 이미 등록되어 있습니다."],
"vs/platform/dialogs/common/dialogs":["...1개의 추가 파일이 표시되지 않음","...{0}개의 추가 파일이 표시되지 않음"],"vs/platform/dialogs/node/dialogService":["취소"],"vs/platform/extensionManagement/common/extensionManagement":["확장","기본 설정"],"vs/platform/extensionManagement/node/extensionGalleryService":["VS Code의 현재 버전 '{0}'과(와) 호환되는 확장을 찾을 수 없으므로 다운로드할 수 없습니다."],
"vs/platform/extensionManagement/node/extensionManagementService":["잘못된 확장: package.json이 JSON 파일이 아닙니다.","'{0}' 확장은 Code '{1}'과(와) 호환되지 않으므로 설치할 수 없습니다.","{0}을(를) 다시 설치하기 전에 Code를 다시 시작하세요.","이 확장의 최신 버전이 이미 설치되어 있습니다. 이 버전을 이전 버전으로 재정의하시겠습니까?","재정의","취소","의존성 설치 중 오류가 발생했습니다. {0}","Marketplace를 사용할 수 없습니다.","확장을 제거하는 동안 오류가 발생했습니다. {0}. 다시 시도하기 전에 VS Code를 종료하고 다시 시작하세요.","마켓플레이스 확장만 다시 설치할 수 있습니다.","'{0}'을(를) 설치할 수 없습니다; VS Code '{1}'과 호환되는 버전이 없습니다.","문제가 있다고 보고되었으므로 확장을 설치할 수 없습니다.","VS Code의 현재 버전 '{1}'과(와) 호환되는 종속된 확장 '{0}'을(를) 찾을 수 없으므로 설치할 수 없습니다.","확장을 설치할 수 없습니다. 다시 설치하기 위해 VS Code를 종료하고 다시 시작하십시오.","확장을 설치할 수 없습니다. 다시 설치하기 전에 VS 코드를 종료한 후 다시 시작하십시오. ","이름을 {0}에서 {1}(으)로 변경하는 중 알 수 없는 오류 발생","'{0}'만 제거할까요, 아니면 종속성도 제거할까요?","확장만","모두 제거","취소","확장 '{0}'을(를) 제거할 수 없습니다. 확장 '{1}'이(가) 이 확장에 종속됩니다.","확장 '{0}'을(를) 제거할 수 없습니다. 확장 '{1}' 및 '{2}'이(가) 이 확장에 종속됩니다.","확장 '{0}'을(를) 제거할 수 없습니다. 확장 '{1}', '{2}' 등이 이 확장에 종속됩니다.","확장을 찾을 수 없음"],
"vs/platform/extensions/node/extensionValidator":["`engines.vscode` 값 {0}을(를) 구문 분석할 수 없습니다. ^1.22.0, ^1.22.x 등을 사용하세요.","`engines.vscode`({0})에 지정된 버전이 명확하지 않습니다. vscode 버전이 1.0.0 이전이면 최소한 원하는 주 버전과 부 버전을 정의하세요( 예: ^0.10.0, 0.10.x, 0.11.0 등).","`engines.vscode`({0})에 지정된 버전이 명확하지 않습니다. vscode 버전이 1.0.0 이후이면 최소한 원하는 주 버전을 정의하세요(예: ^1.10.0, 1.10.x, 1.x.x, 2.x.x 등).","확장이 Code {0}과(와) 호환되지 않습니다. 확장에 {1}이(가) 필요합니다."],"vs/platform/request/node/request":["HTTP","사용할 프록시 설정입니다. 설정되지 않으면 http_proxy 및 https_proxy 환경 변수에서 가져옵니다.","제공된 CA 목록에 대해 프록시 서버 인증서를 확인해야 하는지 여부를 나타냅니다.","모든 네트워크 요청에 대해 'Proxy-Authorization' 헤더로 보낼 값입니다."],"vs/platform/telemetry/common/telemetryService":["원격 분석","사용 데이터와 오류를 Microsoft에 전송할 수 있습니다."]});
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/24f62626b222e9a8313213fb64b10d741a326288/core/vs/code/node/cliProcessMain.nls.ko.js.map
