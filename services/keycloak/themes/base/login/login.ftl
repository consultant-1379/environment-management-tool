<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=social.displayInfo displayWide=(realm.password && social.providers??); section>
    <#if section = "header">
        <div class="eb-system-bar-logo"></div>
        <h1 class="${properties.customReleaseToolH1!}">ENVIRONMENT MANAGEMENT TOOL</h1>
    <#elseif section = "form">
    <div id="kc-form" <#if realm.password && social.providers??>class="${properties.kcContentWrapperClass!}"</#if>>
      <div id="kc-form-wrapper" <#if realm.password && social.providers??>class="${properties.kcFormSocialAccountContentClass!} ${properties.kcFormSocialAccountClass!}"</#if>>
        <#if realm.password>
            <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                <div class="${properties.kcFormGroupClass!}">
                    <label for="username" class="${properties.kcLabelClass!} ${properties.formLabels!}"><#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if></label>
                    <#if usernameEditDisabled??>
                        <input tabindex="1" id="username" class="${properties.kcInputClass!}" name="username" value="${(login.username!'')}" type="text" disabled />
                    <#else>
                        <input tabindex="1" id="username" class="${properties.kcInputClass!}" name="username" value="${(login.username!'')}"  type="text" autofocus autocomplete="off" />
                    </#if>
                </div>
                <div class="${properties.kcFormGroupClass!}">
                    <label for="password" class="${properties.kcLabelClass!} ${properties.formLabels}">${msg("password")}</label>
                    <input tabindex="2" id="password" class="${properties.kcInputClass!}" name="password" type="password" autocomplete="off" />
                </div>
                <div class="${properties.kcFormGroupClass!} ${properties.kcFormSettingClass!}">
                    <div id="kc-form-options">
                        </div>
                        <div class="${properties.kcFormOptionsWrapperClass!}">
                            <#if realm.resetPasswordAllowed>
                                <span><a tabindex="5" href="${url.loginResetCredentialsUrl}">${msg("doForgotPassword")}</a></span>
                            </#if>
                        </div>
                  </div>
                  <div id="kc-form-buttons">
                    <input class="${properties.customButton!}" tabindex="4" name="login" id="kc-login" type="submit" value="${msg("doLogIn")}"/>
                  </div>
            </form>
        </#if>
        </div>
      </div>
    <#elseif section = "info" >
    </#if>
</@layout.registrationLayout>
