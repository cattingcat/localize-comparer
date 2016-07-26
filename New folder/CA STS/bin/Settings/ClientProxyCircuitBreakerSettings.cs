using System;
using System.Linq;
using KasperskyLab.CompanyAccount.CircuitBreaker;
using KasperskyLab.CompanyAccount.CircuitBreaker.Policies;
using KasperskyLab.CompanyAccount.CircuitBreaker.Rules;
using KasperskyLab.CompanyAccount.Settings.Technical.CircuitBreaker;
using Microsoft.Practices.Unity;
using WebApiSettingsRegistry = KasperskyLab.CompanyAccount.WebApiInfrastructure.Settings.SettingsRegistry;

namespace KasperskyLab.CompanyAccount.Web.Settings
{
    public static class ClientProxyCircuitBreakerFactory
    {
        public static void ConfigureCircuitBreaker(this IUnityContainer container)
        {
            var mode = WebApiSettingsRegistry.CircuitBreakerSettings.ProxyClientCircuitBreakerMode;
            if (mode == CircuitBreakerModes.Sync)
            {

                Type[] whiteEceptionList = WebApiSettingsRegistry.CircuitBreakerSettings.ProxyClientCircuitBreakerWhiteList
                    .Select(value => value.Trim())
                    .Select(Type.GetType)
                    .Where(value => value != null)
                    .ToArray();
                Type[] blackEceptionList = WebApiSettingsRegistry.CircuitBreakerSettings.ProxyClientCircuitBreakerBlackList
                    .Select(value => value.Trim())
                    .Select(Type.GetType)
                    .Where(value => value != null)
                    .ToArray();
                string[] methodList = WebApiSettingsRegistry.CircuitBreakerSettings.ProxyClientCircuitBreakerMethodList
                    .Select(value => value.Trim())
                    .ToArray();


                var maxFailures = WebApiSettingsRegistry.CircuitBreakerSettings.ProxyClientCircuitBreakerMaxFailures;
                var pause = WebApiSettingsRegistry.CircuitBreakerSettings.ProxyClientCircuitBreakerPause;

                container.RegisterInstance(new CircuitBreakerBuilder(
                    preInvokeRule: new MethodFilterCircuitBreakerInvokeRule(methodList),
                    postInvokeRule: new AllCircuitBreakerInvokeRule(
                        new AttemptCountExitCircuitBreakerInvokeRule(maxFailures),
                        new ExceptionFilterCircuitBreakerInvokeRule(blackEceptionList),
                        new NotCircuitBreakerInvokeRule(new ExceptionFilterCircuitBreakerInvokeRule(whiteEceptionList)),
                        new SleepPauseCircuitBreakerInvokeRule(pause)),
                    policy: new SyncCircuitBreakerPolicy()));
            }
            else
            {
                container.RegisterInstance(CircuitBreakerBuilder.Disabled);
            }
        }
    }
}